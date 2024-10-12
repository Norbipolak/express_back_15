import conn from "./conn.js";
import checkAdminPermission from "./checkAdminPermission.js";
import nullOrUndefined from "./nullOrUndefined.js";
import trim from "./trim.js";
import nan from "./nan.js";
import getMySqlDate from "./getMySqlDate.js";
import fs from "fs";
//Ezeket be kell importálni, amikor megcsináltuk a class-t, mert be lesznek ezzel hívva

class Products {
    checkData(product) {
        const errors = [];
        //itt ezt meghívhatjuk, mert akkor nem kell több helyen és ami bejön majd objektum azoknak az értékei trim()-elve lesznek 
        trim(product);

        if (nullOrUndefined(product.title) || product.title.length < 2) {
            errors.push("A címnek legalább 2 karakteresnek kell lennie!");
        }

        if (nullOrUndefined(product.productName) || product.productName.length < 2) {
            errors.push("A terméknévnek legalább 2 karakteresnek kell lennie!");
        }

        if (nullOrUndefined(product.productCategory) || product.productCategory.length === 0) {
            errors.push("A termékkategóriát kötelező kivélasztani!");
        }

        //description az ne legyen üres 
        if (nullOrUndefined(product.productDesc) || product.productDesc.length === 0) {
            errors.push("A leírás mező nem maradhat üres!");
        }

        //mert lehet az ár nulla is 
        if (nullOrUndefined(product.price) || product.price > 0) {
            errors.push("Az ár mező nem maradhat üres és nem lehet nullánál kisebb!");
        }

        /*
            A discountPrice nem lehet null vagy undefined, mert hogyha beküldjük a form-ot, akkor kell, hogy legyen 
            egy olyan mező, hogy discountPrice
            Viszont ha meg üres, akkor nem akartuk a terméknek discountPrice-t adni 
        */
        if (nullOrUndefined(product.discountPrice || product.discountPrice > 0)) {
            errors.push("A diszkont árat be kell állítani (Ha nulla, akkor nincs)!");
        }

        return errors;

    }

    async createProduct(product, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);
        const errors = this.checkData(product);

        if (errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(`
            INSERT INTO products (title, productCategory, productName, productDesc, price, discountPrice)
            VALUES(?,?,?,?,?,?)`,
                [product.title, product.productCategory, product.productName, product.productDesc, product.price, product.discountPrice]
            );

            if (response[0].affectedRows === 1) {
                return {
                    status: 200,
                    message: ["Sikeres létrehozás!"],
                    insertID: response[0].insertId
                }
            } else {
                throw {
                    status: 503,
                    message: ["A szolgáltatás ideiglenesen nem érhető el!"]
                }
            }

        } catch (err) {
            console.log("Products.createProduct", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async getProductByID(productID) {
        /*
            Ide nem kell userID meg isAdmin, mert ez egy publikus felületen is meg fog jelenni, elég csak a productID-t bekérni
        */
        /*
             Azt kell megnézni, hogy a productID egy szám-e, amit itt megkapunk, mert ha ez nem szám, akkor az problémát jelenthet 
             function nan(num) {
                 return isNaN(parseInt(num))
             }
             tehát parseInt-elni kell a productID, amit itt megkapunk és utána megnézni az isNaN()-val, hogy az szám-e 
             fontos, hogy ezt használni akarjuk, akkor be kell importálni (import nan from "./nan.js";)
             a nan.js-en meg fontos, hogy export default nan;
        */
        if (nan(productID)) {
            throw {
                status: 400,
                message: ["Nem megfelelő termékazonosító"]
            }
        }

        try {
            const response = await conn.promise().query("SELECT * FROM products WHERE productID = ?",
                [productID])

            if (response[0].length > 0) {
                return response[0][0];
            } else {
                throw {
                    status: 404,
                    message: ["A termék nem található!"]
                }
            }
        } catch (err) {
            console.log("Products.getProductByID", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A termék lekérdezése szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async updateProduct(product, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);
        const errors = this.checkData(product);

        if (errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
            const response = await conn.promise().query(`
            UPDATE products SET productCategory = ?,
            title = ?, productName = ?, productDesc = ?, price = ?, discountPrice = ?, updated = ?
            WHERE productID = ?`,
                [product.productCategory, product.title, product.productName, getMySqlDate(new Date),
                product.price, product.discountPrice, product.productID]

            );

            if (response[0].affectedRows === 1) {
                return {
                    status: 200,
                    message: ["Sikeres felülírás!"]
                }
            } else {
                throw {
                    status: 404,
                    message: ["A termék nem található!"]
                }
            }
        } catch (err) {
            console.log("Products.updateProduct", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A termék lekérdezése szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async getProducts(page) {
        try {
            /*
                itt majd arre kell figyelni, hogy a termékkategóriát ki kell írni szöveggel
            */
            const offset = !nan(page) ? (page - 1) * 8 : 0;

            const response = await conn.promise().query(`
            SELECT SQL_CALC_FOUND_ROWS product.*, product_categories.categoryName
            FROM products
            INNER JOIN product_categories
            ON products.productCategory = product_categories.categoryID
            LIMIT 8 OFFSET = ?`
            [offset]
            );

            const foundRowsResp = await conn.promise().query("SELECT FOUND_ROWS() AS totalRows");
            const totalRows = foundRowsResp[0][0].totalRows;
            /*
                Ez az mondja meg, hogy hány darab termék található meg az adatbázisban 
                ami a foundRowsResp[0][0]
            */

            /*
                A szokásos response mellett meg ezt is vissza kell adni, ezért egy objektumot fogunk itt visszaadni
            */
            return {
                products: response[0],
                maxPage: Math.ceil(totalRows / 8)
                /*
                    Azért Math.ceil, azért kerekítünk felfele, mert ha van 25 darab termék, akkor az hány oldal 25/8 = 3.125 és az nem ennyi oldal
                    meg nem is 3, hanem ez 4 oldal és a 4-dik lesz még egy darab termék 
                */
            }
        } catch (err) {
            console.log("Products.getProducts", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A termék lekérdezése szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async getFilePath(productID) {
        try {
            const response = await conn.promise().query(
                `SELECT filePath FROM products WHERE productID = ?`,
                [productID]
            )

            if (response[0].length > 0) {
                return response[0][0].filePath
            } else {
                throw {
                    status: 404,
                    message: ["A keresett termék nem található!"]
                }
            }
        } catch (err) {
            console.log("Products.getFilePath", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A termék lekérdezése szolgáltatás jelenleg nem érhető el!"]
            }
        }
    }

    async updateFilePath(productID, filePath, userID, isAdmin) {
        checkAdminPermission(userID, isAdmin);

        try {
            const response = await conn.promise().query(
                `UPDATE products SET filePath = ? WHERE productID = ?`,
                [filePath?.trim(), productID]
            )

            if (response[0].affectedRows > 0) {
                return {
                    status: 200,
                    message: ["Sikeres feltöltés!"]
                }
            } else {
                throw {
                    status: 404,
                    message: ["A termék nem taláható!"]
                }
            }
        } catch (err) {
            console.log("Products.updateFilePath", err);

            if (err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A termékkép felülírása szolgáltatás nem érhrető el!"]
            }
        }
    }

    /*
        Fontos, hogy be legyen itt hívva az fs, mert itt használni fogjuk 
        
        Az a kérdés, hogy az unlink van-e visszatérési értéke, hogy sikerült letörörlni, 
        mert aszerint adunk vissza neki egy true-t vagy egy false-t, vagy dobunk egy hibtá vagy ilyesmi
        de valószinű nincsen és ő is csak egy hibát fog dobni
        ezért beteszük az egészet egy try-catch blokkba
    */
    async deleteProductImage(productID, userID, isAdmin, isUpload = false) {
        checkAdminPermission(userID, isAdmin);

        try {
            const filePath = await this.getFilePath(productID); 
            //fontos, hogyha itt egy másik függvény van meghívva, ami itt van a class-ban, akkor a this-vel hívatkozunk rá
            const fullPath = "./product-images/" + filePath;
            /*
                ezt az if-ben (!nullOrUndefined(filePath) azért nem kell megnézni, emrt össe van füzve -> "./product-images/" + filePath;
                mert akkor már úgy sem lesz null vagy undefined 
            */
    
            if(fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
            } else if(!isUpload) { 
                //és itt dobunk egy olyan hobát, hogy a file nem található 
                return {
                    status: 403, 
                    message: ["A törölni kívánt fájl nem található!"]
                }
            }
        } catch(err) {
            //elöször magunknak kiírjuk, hogy hol van a hiba
            console.log("Products.deleteProductImage", err);

            //tehát ha van az err-nak status-a, az a hiba (403-as), amit a try-ban dobtunk akkor ezt továbbdobjuk egy throw-val
            if(err.status) {
                throw err;
            }

            //egyébként meg throw-olunk egy ilyet 
            throw {
                //itt nem tudjuk, hogy milyen status de beírunk egy 404-eset, valószinüleg akkor dog hibát ha nem találja magát a file-t
                //inkább az lesz, hogy 503  
                status: 503,
                message: ["A fájl törlés funkció ideiglenesen nem érhető el!"]
            }
        }
    }

    /*
        itt csak egy productID-t kértünk be, mert az kell a filePath-nak, ami innen származik és itt is hívjuk meg a this-vel 
        és a fullPath meg a filePath-ot használja, tehát azt sem kell kivülről megkapni
    */
}




export default Products;