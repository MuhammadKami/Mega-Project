module.exports = (fn) => {
  return (req, res, err, next) => {
    fn(req, res, err, next).catch(err);
  };
};
