import checkAdminPermission from "./checkAdminPermission.js";
import conn from "./conn.js";
import nullOrUndefined from "./nullOrUndefined.js";

class ProductCategories {
    checkData(category) {
        const errors = [];
        trim(category);

        if (nullOrUndefined(category.categoryName) || category.categoryName.length === 0) {
            errors.push("A kategória elnevezése mező nem maradhat üres!");
        }

        if (nullOrUndefined(category.categoryDesc) || category.categoryDesc.length === 0) {
            errors.push("A kategória leírása mező nem maradhat üres!");
        }

        return errors;
    }

    async createCategory(category, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);
        //trim(category);
        /*
            Hogy amik bejönnek category (az egy objektum) és ezzel a trim-vel azt csináltuk, hogy ha az értéke a kulcsoknak string, akkor 
            trim()-eljük őket 
            ->
            for(const key in object) {
                if(typeof obj[key] === "string") 
                    obj[key] = obj[key].trim();

            Mert ha beíruk három szóközt, akkor ezen a szürőn nem fog fentakadni -> category.categoryName.length === 0, mert a length-je már nem 
            lesz nulla, de hogyha előtte trim()-eljük, kivesszük a szóközöket és utána nézzóük meg utána akkor már fent fog!! 
            de mivel az majd lesz egy olyan update nem csak add, ezért ezt az egészet meg lehet csinálni már a checkData-nál 
        */
        const errors = this.checkData(category);

        if (errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(`
                INSERT INTO product_categories (categoryName, categoryDesc)
                VALUES`,
                [category.categoryName, category.categoryDesc]
            );

            if (response[0].affectedRows === 1) {
                return {
                    status: 200,
                    message: ["Sikeres feltöltés!"],
                    insertID: response[0].insertID
                    /*
    Azért kell az insertId, mert mint múltkor is a címmek, azt csináltuk, hogy átírányítottuk miután megcsináltuk 
    és akkor az url-hez hozzáadtunk egy ilyen részt, hogy /id, az egy url param volt és ez az ID kell ide 
    -> 
    if(success) {                                                           *****
        res.status(response.status).redirect(`/user/cim-letrehozasa/${response.insertID}?message=${response.message}&success=${success}`);
                    */
                }
            } else {
                throw {
                    status: 503,
                    message: ["A szolgáltatás jelenleg nem érhető el!"]
                }
            }


        } catch (err) {
            console.log("ProductCategories.addCategory", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }

        

        /*
            Mert valamikor kapunk itt valami hibát 
                    try {
                const response = await conn.promise().query(`
                INSERT INTO product_categories (categoryName, categoryDesc)
                VALUES`, 
                [category.categoryName, category.categoryDesc]
            );
            Nem tudjuk elérni a szervert, nem müködik egyáltalán, kapunk egy hibát 
            De ilyenkor nincsen err.status, mert olyan hibaüzenetet kapunk, hogy a myqsl valamiért nem elérhető 
            És akkor itt nem ezt dobjuk 
            if(err.status) {
                throw err;
            }
            Hanem kiírjuk a console-ra, hogy mi van -> console.log("ProductCategories.addCategory", err), megmondjuk a rendszergazdának, hogy 
            indítsa el újra a szolgáltatást 
            és akkor ide nem jövünk be!!!
            if(err.status) {
                throw err;
            Hanem csak azt mondjuk a felhasználónak, hogy a szolgáltatás nem elérhető 
            ->
            throw {
                status: 503, 
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
            
        */
    }

    async getProductCategories() {
        //checkAdminPermission(userID, isAdmin);
        //itt ez nem is kell, mert majd a user-eknél is meg fog jelenni, hogy milyen kategóriák vannak, meg akkor ez se kell userID, isAdmin

        try {
            const response = await conn.promise().query("select * from product_categories");
            return response[0];
        } catch (err) {
            console.log("ProductCategories.getProductCategories", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async getCategoryByID(categoryID) {
        try {
            const response = await conn.promise().query(
                "SELECT * FROM product_categories WHERE categoryID = ?"
                [categoryID]
            );
            return response[0][0];
        } catch (err) {
            console.log("ProductCategories.getCategoryByID", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async updateCategory(category, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);
        const errors = this.checkData(category);

        if (errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        /*
            Fontos, hogy az endpointnál meg kell oldani, hogy legyen categoryID, mert az param-ból jön!!! 
            és bele kell majd a category-ba, amit visszaadunk itt, tehát abba az objektumban kell majd a categoryName, categoryDesc
            meg egy categoryID ami req.params.categoryID
            ->
            const categoryData = req.body;
        1   categoryData.categoryID = req.params.categoryID;
        */

        try {
            const response = await conn.promise().query(`
                UPDATE product_categories SET 
                categoryName = ? 
                categoryDesc = ?
                WHERE categoryID = ?`,
                [category.categoryName, category.categoryDesc, category.categoryID]
            );

            if (response[0].affectedRows === 1) {
                return {
                    status: 200,
                    message: ["Sikeres feltöltés!"],
                    //insertID: response[0].insertID itt már tudjuk az id-t, ezért nem kell visszaadni ezt az insertID-t 
                }
            } else {
                throw {
                    status: 503,
                    message: ["A szolgáltatás jelenleg nem érhető el!"]
                }
            }


        } catch (err) {
            console.log("ProductCategories.addCategory", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async deleteCategory(categoryID, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);

        try {
            const response = await conn.promise().query(`
                DELETE from product_categories
                WHERE categoryID = ?`,
                [categoryID]
            )

            if(response[0].affectedRows) {
                return {
                    status: 200,
                    message: ["Sikeres törlés!"]
                }
            } else {
                throw {
                    status: 404,
                    message: ["A bejegyzés nem található az adatbázisban"]
                }
            }
        } catch(err) {
            console.log("ProductCategories.addCategory", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }
}

export default ProductCategories;