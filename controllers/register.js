const handleRegister = (req, res, db, bcrypt, saltRounds) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission");
  }
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  db.transaction((trx) => {
    //create a transaction when we have to do more than two things at once when modifying database items.
    trx //use trx, instead of db, to do the operations.
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]); //respond it with JSON.
          });
      })
      .then(trx.commit) //for the above to get added, we need to commit.
      .catch(trx.rollback); //if anything fails, we roll back the changes.
  }).catch((err) => res.status(400).json("unable to join"));
};

module.exports = {
  handleRegister: handleRegister,
};
