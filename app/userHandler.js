import checkAdminPermission from "./checkAdminPermission.js";
import conn from "./conn.js";
import nullOrUndefined from "./nullOrUndefined.js";
import passHash from "./passHash.js";

class UserHandler {
    checkData(user) {
        const errors = [];
        const emailRegex = /^[\w\_\-\.]{1,255}\@[\w\_\-\.]{1,255}\.[\w]{2,8}$/;

        if(nullOrUndefined(user.email) || !emailRegex.test(user.email)) {
            errors.push("A megadott email cím nem megefelelő!");
        }

        if(nullOrUndefined(user.pass) || user.pass.length < 8) {
            errors.push("A jelszónak legalább 8 karakteresnek kell lennie!");
        }
        /*
            user.pass.length > 8 érdemes olyan jelszót megkövetelni a felhasználótól, ami egy minimálisan is biztonságos -> user.pass.length > 8
        */

        if(nullOrUndefined(user.userName) || user.userName < 5) { //legyen legalább 5 karakteres a userName 
            errors.push("A felhasználónévnek legalább 5 karakteresnek kell lennie!");
        } 

        if(user.pass !== user.passAgain) {
            errors.push("A jelszó nem egyezik!")
        }
            
        return errors;
    }

    async register(user) {
        const errors = this.checkData(user);
        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(
                `INSERT INTO users (userName, email, pass)
                VALUES(?,?,?)`
                [user.userName, user.email, passHash(user.pass)]
            );

            if(response[0].affectedRows === 1) {
                return {
                    status: 201,
                    message: ["A regisztráció sikeres volt!"]
                }
            } else {
                throw {
                    status: 503, 
                    message: ["A regisztrációs szolgáltatás jelenleg nem érhető el!"]
                }
            }
        } catch(err) {
            console.log("UserHandler.register: ", err);

            if(err.status) {
                throw err;
            }
            
            throw {
                status: 503,
                message: ["A regisztrációs szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }

    async login(user) {
        try {
            const response = await conn.promise().query(
                `SELECT userID, userName, isAdmin FROM users WHERE email = ? AND pass = ?`,
                [user.email, passHash(user.pass)]
            )

            if(response[0] === 1) {
                return {
                    status: 200,
                    message: response[0][0]
                }
            } else {
                throw {
                    status: 401, 
                    message: ["Nem megfelelő felhasználónév/jelszó páros!"]
                }
            }
        } catch (err) {
            console.log("UserHandler.login: ", err);

            if(err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A bejelentkezési szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }

    async search(userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);

        try {
            const response = await conn.promise().query("SELECT * FROM users");
            return response[0]
        } catch(err) {
            console.log("UserHandler.search: ", err);

            if(err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A bejelentkezési szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }

}

export default UserHandler;
