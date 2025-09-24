import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token)
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user ID
    console.log("Decoded JWT:", decoded);
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

