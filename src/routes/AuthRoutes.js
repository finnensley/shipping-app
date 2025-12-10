import express from 'express';
import { Login, SignUp } from "../controllers/AuthControllers.js"
import { DevLogin } from "../controllers/AuthControllers.js";

const routes = express.Router();

routes.get("/", (req, res) => {
    res.json({msg: "Testing the connection for the AuthRoutes" });
})

// signup routes
routes.post("/signup", SignUp);

// login routes
routes.post("/login", Login);

// automatic login for development
routes.post("/dev-login", DevLogin);

export default routes;