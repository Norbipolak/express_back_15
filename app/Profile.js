import conn from "./conn.js";
import nullOrUndefined from "./nullOrUndefined.js";


class Profile {
    checkData(profile) {
        const errors = [];
        const emailRegex = /^[\w\_\-\.]{1,255}\@[\w\_\-\.]{1,255}\.[\w]{2,8}$/;

        if(nullOrUndefined(profile.email) || !emailRegex.test(profile.email)) {
            errors.push("A megadott email cím nem megefelelő!");
        }

        if(nullOrUndefined(profile.userName) || profile.userName < 5) { 
            errors.push("A felhasználónévnek legalább 5 karakteresnek kell lennie!");
        } 

        if(nullOrUndefined(profile.firstName) || profile.firstName < 4) { 
            errors.push("A keresztnévnek legalább 4 karakteresnek kell lennie!");
        } 

        
        if(nullOrUndefined(profile.lastName) || profile.lastName < 4) { 
            errors.push("A vezetéknévnek legalább 4 karakteresnek kell lennie!");
        } 

        return errors;
    }

    async updateProfile(profile) {
        const errors = this.checkData(profile);
        /*
            nagyon fontos, hogy itt valamire hivatkozunk, akkor az előtt ott kell, hogy legyen a THIS!!!!!! 
        */

        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(`
                UPDATE users SET userName = ?, email = ?, firstName = ?, lastName = ?
                WHERE userID = ?`,
                [profile.userName.trim(), profile.email.trim(), 
                profile.firstName.trim(), profile.lastName.trim(),
                profile.userID]
            )

            if(response[0].affectedRows === 1) { //hány rekordra van hatással ez a bizpnyos update
                return {
                    status: 200,
                    message: ["Sikeres mentés!"]
                }
            } else {
                throw {
                    status: 404,
                    /*
                        Mert hogyha nem okozott semmilyen módosítást az adatbázisban, akkor nincs is ilyen rekord!! 
                    */
                   message: ["A felhasználói profil nem található!"]
                }
            }

        } catch(err) {
            console.log("Profile.updateProfile: ", err);

            if(err.status) {
                throw err;
            }
            throw {
                status: 503,
                message: ["A profil mentése szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }

    async getProfile() {
        try {
            const response = await conn.promise().query(`
                SELECT * FROM users WHERE userID = ?`,
                [userID]
            )

            if(response[0].length > 0) {
                return {
                    status: 200,
                    message: response[0][0] //mert itt az első rekord 
                }
            } else {
                throw {
                    status: 404, 
                    message: ["A felhasználói profil nem található!"]
                }
            }

        } catch(err) {
            console.log("Profile.getProfile: ", err);

            if(err.status) {
                throw err;
            }
            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }


}  

export default Profile;
