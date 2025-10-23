import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization header:", authHeader);
  
  if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
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

