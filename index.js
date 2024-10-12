import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import UserHandler from "./app/userHandler,js"; 
import session from "express-session"
import successHTTP from "./app/successHTTP.js";
import Addresses from "./app/Addresses.js";
import getMessageAndSuccess from "./app/getMessageAndSuccess.js";
import checkPermission from "./app/checkPermission.js";
import checkAdminPermission from "./app/checkAdminPermission.js";
import ProductCategories from "./app/ProductCategories.js";
import nullOrUndefined from "./app/nullOrUndefined.js";
import fs from "fs";

const app = express();

app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(urlencoded({extended: true}));
app.use(express.static("assets"));
app.use(express.static("product-images"));

app.use(session());

app.use(session({
    secret: "asdf",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24*60*60*1000
    }
}));

const uh = new UserHandler();
const p = new Profile(); 
const a = new Addresses();
const pc = new ProductCategories();
const pr = new Products();

app.get("/", (req, res)=> {
    res.render("public/index", 
        {
            layout: "layouts/public_layout", 
            title: "Kezdőlap", 
            baseUrl: process.env.BASE_URL,
            page:"index",
            message:req.query.message ? req.query.message : ""
        }
    );
});

app.post("/regisztracio", async (req, res)=> {
    let response;
    try {
        response = await uh.register(req.body); 
    } catch (err) {
        response = err;
    }

    //response.success = response.status.toString(0) === "2";
    response.success = successHTTP(response.status);
    res.status(response.status);

    res.render("public/register_post", {
        layout: "./layout/public_layout",
        message: response.message,
        title: "Regisztráció",
        baseUrl: process.env.BASE_URL,
        page: "regisztracio", 
        success: response.success
    })
});

app.post("/login", async (req, res)=> {
    let response;
    let path;

    try{
        response = uh.login(req.body);
        req.session.userName = response.message.userName;
        req.session.userID = response.message.userID;
        req.session.isAdmin = response.message.isAdmin;

        path = response.message.isAdmin == 0 ? "/user/profil" : "/admin/profil"
    } catch(err) {
        response = err;
    }

    response.success = successHTTP(response.status);


    res.status(response.status).redirect(
        response.success ? path : `/bejelentkezes?message=${response.message[0]}`
    )

})

app.get("/bejelentkezes", (req, res)=> {
    res.render("public/login", {
        layout: "./layouts/public_layout",
        title: "Bejelentkezés",
        baseUrl: process.env.BASE_URL,
        page: "bejelentkezes",
        message: req.query.message ? req.query.message : ""
    })
});

app.get("/user/profil", async (req, res)=> {
    try {
        checkPermission(req.session.userID);
        const profileData = await p.getProfile(req.session.userID);
        //const messages = req.query.messages.split(",");
        /*
            Mert a getProfile függvény vár egy id-t és az alapján lehozza az összes (*) adatot, ahhoz az id-ű rekordhoz 
        */
        //csináltunk egy segédfüggvényt
        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("user/profile", {
            layout: "./layouts/user_layout",
            title: "Profil Szerkesztése",
            baseUrl: process.env.BASE_URL,
            profileData: profileData.message, //itt meg megszerezzük az összes mezőt az adatbázisból 
            page: "profil", 
            message: messageAndSuccess.message,
            success: messageAndSuccess.success
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.post("/user/profil", async (req, res)=> {
    let response;

    try {
        const user = req.body;
        user.userID = req.session.userID;
        response = await p.updateProfile(user);
    } catch(err) {
        response = err;
    }

    console.log(response);

        
    const success = successHTTP(response.status);
    res.redirect(`/user/profil?success=${success}&messages=${response.message}`);
});

app.get("/user/cim-letrehozasa", async (req, res)=> {
    try {
        checkPermission(req.session.userID);
        const addressTypes = await a.getAddressTypes();
        const messageAndSuccess = getMessageAndSuccess(req.query);
    
        res.render("user/create_address", {
            layout: "./layouts/user_layout", 
            title: "Címek létrehozása", 
            page: "címek",
            addressTypes: addressTypes,
            baseUrl: process.env.BASE_URL,
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            address:{}
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    } 
   
});

app.post("/user/create_address", async (req, res)=> {
    //itt szedjük majd le az adatokat 
    let response;

    try {
        response = await a.createAddress(req.body, req.session.userID);
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.status);

    if(success) {
        res.status(response.status).redirect(`/user/cim-letrehozasa/${response.insertID}?message=${response.message}&success=${success}`);
    } else {
        res.status(response.status).redirect(`/user/cim-letrehozasa?message=${response.message}&success=${success}`);
    }
    
});

app.get("/user/cim-letrehozasa:addressID", async (req, res)=> {
    try {
        checkPermission(req.session.userID);
        const addressTypes = await a.getAddressTypes();
        const messageAndSuccess = getMessageAndSuccess(req.query);
        const address = await a.getAddressByID(req.params.addressID, req.session.userID);
        console.log(address);
    
        res.render("user/create_address", {
            layout: "./layouts/user_layout", 
            title: "Címek létrehozása", 
            baseUrl: process.env.BASE_URL,
            page: "címek",
            addressTypes: addressTypes,
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            address:address
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    } 
});

app.post()

app.get("/user/címek", async (req, res)=> {
    let response;

    try {
        checkPermission(req.session.userID),
        response = await a.getAddressesByUser(req.session.userID);
    } catch(err) {
        if(err.status === 403) {
            res.redirect(`/message=${err.message}`);
        }
        response = err;
    }

    res.render("user/addresses", { 
        layout: ".layout/user_layout",
        addresses: response.message,
        baseUrl: process.env.BASE_URL,
        title: "Címek", 
        page: "címek"
    })
});

app.post("user/create-address/:addressID", async (req, res)=> {
    let response;

    try {
        const address = req.body;
        address.addressID = req.params.addressID;
        response = await a.updateAddress(address, req.session.userID);
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    res.redirect(`/user/cim-letrehozasa/${req.params.addressID}?message=${response.message}&success=${success}`);
    /*
        fontos, hogy azokat ami egy url változó query, azt ?xx=xx formátumba kell csinálni   
    */
})

app.get("/admin/profil", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );
        const profileData = await p.getProfile(req.session.userID);
        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("admin/profile", {
            layout: "./layouts/admin_layout",
            title: "Profil Szerkesztése",
            baseUrl: process.env.BASE_URL,
            profileData: profileData.message, //itt meg megszerezzük az összes mezőt az adatbázisból 
            page: "profil", 
            message: messageAndSuccess.message,
            success: messageAndSuccess.success
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.get("/admin/felhasznalok", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );

        const users = await uh.search(
            req.session.userID,
            req.session.isAdmin
        )
        
        res.render("admin/users", {
            layout: "./layouts/admin_layout",
            title: "Felhasználok",
            baseUrl: process.env.BASE_URL,
            profileData: users.message,
            page: "felhasznalok", 
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.get("/admin/termek-kategoriak", async (req, res)=> {
    try {
        // checkAdminPermission(
        //     req.session.userID,
        //     req.session.isAdmin
        // );

        const categories = await pc.getProductCategories(
            // req.session.userID,
            // req.session.isAdmin
        )
        
        res.render("admin/product-categories", {
            layout: "./layouts/admin_layout",
            title: "Termék kategóriák",
            baseUrl: process.env.BASE_URL,
            categories: categories,
            page: "termek-kategoriak"
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.get("/admin/termek-kategoria", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );

        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("admin/product-category", {
            layout: "./layouts/admin_layout",
            title: "Termék kategória",
            baseUrl: process.env.BASE_URL,
            page: "termek-kategoria", 
            categoryData: null,
            message: messageAndSuccess.message,
            success: messageAndSuccess.success
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.post("admin/create-category", async (req, res)=> {
    let response;

    try {
        response = await pc.createCategory(
            req.body,
            req.session.userID,
            req.session.isAdmin
        )
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    if(success) {
        res.redirect(`/admin/termek-kategoria/${response.insertID}?message=${response.message}&success=${success}`);
    } else {
        res.redirect(`/admin/termek-kategoria/?message=${response.message}&success=${success}`);
    }
});

app.get("/admin/termek-kategoria/:categoryID", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );

        const categoryData = await pc.getCategoryByID(req.params.categoryID);
        /*
            fontos, hogy itt ha response [0][0], akkor azt az egyet kapjuk meg, ami nekünk kell 
            async getCategoryByID(categoryID) {
                 try {
                    const response = await conn.promise().query(
                    "SELECT * FROM product_categories WHERE categoryID = ?"
                    [categoryID]
                    );
                return response[0][0];                        *****
        */

        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("admin/product-category", {
            layout: "./layouts/admin_layout",
            title: "Termék kategória",
            baseUrl: process.env.BASE_URL,
            page: "termek-kategoria", 
            categoryData:categoryData, 
            message: messageAndSuccess.message,
            success: messageAndSuccess.success
        })
    } catch(err) {
        res.redirect(`/?message=${err.message}`);
    }   
});

app.post("admin/create-category/:categoryID", async (req, res)=> {
    let response;

    try {

        const categoryData = req.body;
        categoryData.categoryID = req.params.categoryID;
        response = await pc.updateCategory(
            categoryData,
            req.session.userID,
            req.session.isAdmin
        )
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    // if(success) {
    //     res.redirect(`/admin/termek-kategoria/${response.insertID}?message=${response.message}&success=${success}`);
    // } else {
    //     res.redirect(`/admin/termek-kategoria/?message=${response.message}&success=${success}`);
    // }
    //itt nem úgy fogunk eljárni, mert nem response.insertID, hanem req.params.category, ahonnan meg van a szám!! 

    res.redirect(`/admin/termek-kategoria/${req.params.categoryID}/?message=${response.message}&success=${success}`);
});

app.post("/admin/delete-category/:categoryID", async (req, res)=> {
    let response;

    try {
        response = await pc.deleteCategory(
            req.params.categoryID,
            req.session.userID,
            req.session.isAdmin
        );
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    res.redirect(`/admin/termek-kategoriak/?message=${response.message}&success=${success}`);
});

//fontos, hogy nincsen még példányunk a Product-ból -> const pr = new Products();
app.get("/admin/termek", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );
    
        /*
            Itt nekünk kell a productCategory
            Ez nagyon fontos, mert ha nincs itt productCategory, akkor nem tudjuk kiválasztani a termék kategóriákat, ilyen legördülősben 
            -> 
        */
        const categories = await pc.getProductCategories()
        /*
            majd amit itt megkapunk termék kategóriákat, azokat át kell adni a render-nek, mert ott majd egy forEach-vel végig kell menni rajtuk!!
        */
        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("admin/product", {
            layout: "./layouts/admin_layout",
            title: "Termék létrehozása",
            baseUrl: process.env.BASE_URL,
            page: "termek", 
            categories: categories,           //***
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            productData: null         
        })
    } catch(err) {
        console.log(err);
        res.redirect(`/?message=${err.message}`);
    }
});

app.post("/admin/create-product", async (req, res)=> {
    let response;

    try {
        response = await pr.createProduct(
            req.body,
            req.session.userID,
            req.session.isAdmin
        );
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    if(success) {
        res.redirect(`/admin/termek/${response.insertID}?message=${response.message}&success=${success}`);
    } else {
        res.redirect(`/admin/termek?message=${response.message}&success=${success}`);
    }
});

app.get("/admin/termek/:productID", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );

        const categories = await pc.getProductCategories()
        const messageAndSuccess = getMessageAndSuccess(req.query);
        const productData = await pr.getProductByID(req.params.productID);

        res.render("admin/product", {
            layout: "./layouts/admin_layout",
            title: "Termék létrehozása",
            baseUrl: process.env.BASE_URL,
            page: "termek", 
            categories: categories, 
            message: messageAndSuccess.message,
            success: messageAndSuccess.success, 
            productData: productData          
        })
    } catch(err) {
        console.log(err);
        res.redirect(`/?message=${err.message}`);
    }
});

app.post("/admin/create-product/:productID", async (req, res)=> {
    let response;

    try {
        req.body.productID = req.params.productID;
        //hogy a body-ban legyen benne a productID is! 
        response = await pr.updateProduct(
            req.body,
            req.session.userID,
            req.session.isAdmin
        );
    } catch(err) {
        response = err;
    }

    const success = successHTTP(response.success);
    res.redirect(`/admin/termek/${req.params.productID}?message=${response.message}&success=${success}`);
});

app.get("/admin/termekek", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );
    
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const products = await pr.getProducts(page);
        const messageAndSuccess = getMessageAndSuccess(req.query);
        
        res.render("admin/products", {
            layout: "./layouts/admin_layout",
            title: "Termékek",
            baseUrl: process.env.BASE_URL,
            page: "termekek",            
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            products: products,
            page:page
        })
    } catch(err) {
        console.log(err);
        res.redirect(`/?message=${err.message}`);
    }
});

app.post("/admin-upload-product-image/:productID", async (req, res) => {
    const form = formidable({allowEmptyFiles: true, minFileSize:0});
    let fields;
    let files;

    form.uploadDir = "./product-images";
    form.keepExtension = true;

    try {
        [fields, files] = await form.parse(req);
        if(files.productImage[0].size === 0) {
            throw {
                status: 400,
                message: ["Nem csatoltál fájlt a kéréshez!"]
            }
        }

        await pr.deleteProductImage(
            req.params.productID, 
            req.session.userID, 
            req.session.isAdmin
        );

        const oldPath = files.productImage[0].filepath;
        const newPath = form.uploadDir + "/" + files.productImage[0].originalFileName;

        
        await fs.promises.rename(oldPath, newPath);


        await pr.updateFilePath(
            req.params.productID, 
            files.productImage[0].originalFileName, 
            req.session.userID, req.session.isAdmin
        );


        res.redirect(`/admin/termekek/${req.params.productID}`);

    } catch(err) {
        console.log(err);
        const message = err.message || ["A fájl feltöltése sikertelen!"];
        
        res.status(err.status || 400).redirect(`/admin/termekek/${req.params.productID}?message=${message}&success=false`);
    }
});

app.post("/admin/delete-product-image/:productID", async (req, res) => {

    try {
        const deleteMsg = await pr.deleteProductImage(req.params.productID, req.session.userID, req.session.isAdmin, true);

        await pr.updateFilePath
        (
            req.params.productID, 
            null, 
            req.session.userID, 
            req.session.isAdmin
        );

        const msg = deleteMsg || ["Sikeres feltöltés!"];

        res.redirect(`/admin/termek/${req.params.productID}?message=${msg}&success=true`);

    } catch (err) {
        res.status(err.status).redirect(`/admin/termek/${req.params.productID}?message=${err.message}&success=false`);
    }
});


app.listen(3000, console.log("the app is listening on localhost:3000"));

/*
    Ha ugy akarunk feltölteni képet, hogy nincs kiválasztva a file input-ban kép amit fel akarunk tölteni, akkor kapunk egy hibaüzenetet 
    options.allows.EmptiyFiles is false, file size should be greater than 0, tehát nem olyan üzenetet amit mi írtunk!!!
    Tehát amikor fel akarunk tölteni és ellenőrizné, hogy van-e fájl, akkor kitörli az elözőt, amit fel volt töltve, mert úgy 
    csináltuk, hogy mindig kitörli az elözőt 
    -> 
    Ez az upload-product-image-s post-os kérés 
    A try-ban az első, amit meghívunk az a deleteProductImage
        await pr.deleteProductImage(
            req.params.productID, 
            req.session.userID, 
            req.session.isAdmin
        ); 
    De ezt csak akkor kell meghívnunk, megcsinálnia, hogyha a files elötte van mint a a deleteProductImage()
    [fields, files] = await form.parse(req);

    és mivel ez a file elöbb meg van, ezért csinálunk egy if-eset, hogyha a file.length === 0 
    akkor dobunk egy hibaüzenetet, hogy nem csatoltunk fájlt 
    -> 
        [fields, files] = await form.parse(req);
        console.log(files);

        if(files.length === 0) {
            throw {
                status: 400,
                message: ["Nem csatoltál fájlt a kéréshez!"]
            }
        }

        await pr.deleteProductImage(
            req.params.productID, 
            req.session.userID, 
            req.session.isAdmin
        );

    De még így is megkaptuk ugyanazt a error-t mint az elején -> options.allows.EmptiyFiles is false, file size should be greater than 0
    ezért egy console.log-val megnézzük, hogy mi van a files-ban 
    Tehát ilyenkor, amikor üres a kérés (nem választunk ki képet és úgy töltjük fel) akkor mi van a files-ban 
    de be sem megyünk oda, tehát a [fields, files] = await form.parse(req);
    ->
    console.log("asdsdf"); -> ez le fog futni itt 
    [fields, files] = await form.parse(req); -> de itt van a hiba és innentől bemegyünk a catch ágba és kiírja azt a hibát, hogy option...
    Tehát ez egy olyan hibaüzenet fog küldeni, nem olyat amilyet mi akarunk, mert hogyha ő már itt elutasítja ([fields, files] = await form.parse(req))
    Meg nem törli le a képet, mert az elöbb meg ez lejebb volt és lefutott a pr.deleteProductImage, ami letörölte a képet, de most, hogy feljebb
    van field,files-os dolog és ott megáll a kód futása és bemegyünk a catch ágba, szóval most már a deleteProductImage nem is fog lefutni 
    és nem is törli le a képet, csak megkapjuk a hibaüzenetet (options.allows.EmptiyFiles is false, file size should be greater than 0)

    Ő itt a parse-olásnál dob egy saját hibát (form.parse(req)) és a catch ágban, ez fog megjelenni 
    ->
    } catch(err) {
        console.log(err);
        const message = err.message || ["A fájl feltöltése sikertelen!"];

    Tehát az lesz az err -> formidableError: options.allowEmptyFiles is false, file should be greater than 0 
    ->
    a try elött ahol csináltunk ezeket a beállításokat, ott mondjuk az allowEmptyFiles-ra, hogy true, és akkor tudunk mi dobni hibaüzenetet
    const form = formidable();
    let fields;
    let files;

    form.uploadDir = "./product-images";
    form.keepExtension = true;
    form.allowEmptyFiles = true;     
    ******** ezzel a beállítással tudjuk beállítani, hogy tudjunk "semmit" is feltölteni, engedi, hogy üresen küldje be
        és akkor mi dobunk olyan hibát amit szeretnénk 

    De ez még így nem müködik, mert const form = formidable(options); 
    itt meg kell kapnia egy options és ennek az option beépített objekumnak ilyen kulcsai vannak 
        encoding {string} - default utf-8, sets encoding from incoming fields
        uploadDir {string} - the directory for placing file uploads in. You can move later by using fs.rename()
        keepExtensions {boolean} - default false, to include extensions of the original files or not 
        allowEmptyFiles {boolean} - default false, allow upload empty files 
        minFileSize {number} - default 1 (1 byte) the minimum size of uploaded file 
        maxFiles, maxFileSize, maxFields stb.... 

    const form = formidable({allowEmptyFiles: true});
    Mert itt kapott a példában egy options (formidable(options)), ami egy objektum, aminek van egy allowEmptyFiles kulcsa, ami egy boolean 
    ez így jó is, de viszont a minFileSize-ot is be kell állítani, mert az default 1 byte, itt meg 0 kell, hogy legyen 
    -> 
    const form = formidable({allowEmptyFiles: true, minFileSize:0});

    Itt ez így már okés, le fog futni a [fields, files], meg kell nézni, hogy a files-ban mi van benne (console.log(files))
    és hogy igaz-e az, hogy a files.length === 0, hogyha nincsen semmi sem csatolva 
    -> 
    const form = formidable({allowEmptyFiles: true, minFileSize:0});
    let fields;
    let files;

    form.uploadDir = "./product-images";
    form.keepExtension = true;

    try {
        [fields, files] = await form.parse(req);
        console.log(files);   ****
    {
        productImage: [
            persistentFile: 
            {
                filePath: ...,
                newFileName: ...,
                lastModifiedDate: null,
                newFileName: ...,
                originalFileName: '',
                size: 0,
                ...
            }
            {
                ....
            }
        ]    
    }

    És ez, hogy files.length === 0 nem jó, mert ebbe van egy productImage tömb, amiben van egy persistentFile objekum (és még vannak objektumok)
    console.log(files.productImage[0].length) -> 1 
    Ez mindenképpen 1 lesz, tehát ez csak úgy tudjuk megoldani, hogy a size = 0, meg az originalFileName is csak egy üres string, ha nem töltünk
        fel semmit, de a size még biztosabban jó 

    Tehát itt a size az 0, hogyha nem csatoltuk semmit 
    ->
    console.log(files.productImage[0].size) -> 0

    Az if-ben ez kell, hogy legyen a kikötés
    -> 
    try {
        [fields, files] = await form.parse(req);
        if(files.productImage[0].size === 0) {
            throw {
                status: 400,
                message: ["Nem csatoltál fájlt a kéréshez!"]
            }
        }
     
    És akkor így írja ki nekünk ezt -> Nem csatoltál fájlt a kéréshez! ha nem csatoltunk fájlt és úgy próbáljuk feltölteni 
    ************************
    Az a következő lépés, hogy felviszünk termék kategóriákat (localhost:3000/admin/termek-kategoria) 
    -> 
    mockaroo.com -> https://www.mockaroo.com/ 
    És ez azt tudja, hogy le tud nekünk generálni adatokat egy bizonyos adatbázis séma szerint 
    ->
    Field Name          Type                      Options
    id                  Row Number                blank:0%
    first_name          First Name                blank:0%
    last_name           Last Name                 blank:0%

    És alatta van egy rows, ahol be tudjuk állítani, hogy mennyi rekordot generáljon le 

    A Field Name-hez be tudjuk írni, hogy nekünk milyen mezőink vannak, option-ben, meg hogy mennyi legyen blank, tehát null (majd az sql-ben)
    És mi most a product_categories-ba szeretnénk ebbe adatokat csináltatni, ahol vannak nekünk ilyen mezőink 
    categoryID          categoryName            categoryDesc

    mackaroo.js, hogy tudunk exportálni 
    
    Beírjuk, most kézzel, hogy milyen mezőink vannak, kiválasztjuk a type-t meg az options 
        ha valamilyen id van pl. itt categoryId, akkor row number kell, hogy a type legyen 

​   Így néz ki a product_categories-ra 
    Field Name          Type                      Options
    categoryID          Row Number                blank:0%
    categoryName        Department(Retail)        blank:0%
    categoryDesc        Blank                     blank:0%   ** itt nem találtunk megfelelő type-ot ami jó lenne, valamilyen loremips szöveget

    Itt rámegyünk, hogy generateData, betesszük a fájlt, amit kaptuk ide ebbe a mappába (express_back_15)
        ez gy csv kiterjesztésű fájl lesz 

    sql-en kiválasztjuk felül, hogy importálás, kiválasztjuk, hogy csv 
    és megadjuk neki a fájl, amit legeneráltunk és betettük ide ebbe a mappába 
    kipipáljuk, hogy adatok frissítése...  
        oszlopok elválasztása , 
        oszlopok körbezárása üres legyen 
        oszlopok escape-elése üres legyen 

    fontos, hogy a rows alapból a mackaroo-n 1000, tehát ennyit fog legenrálni, de nekünk elég ide 10 
    MOCK.data.csv 
    categoryId,categoryName,categoryDesc       ******** ezt majd ki kell törölni, amikor sql-be importálunk 
    1,Industrial,
    2,Games,
    3,Shoes,
    4,Health,
    5,Electronics,
    6,Industrial,
    7,Outdoors,
    8,Automotive,
    9,Tools,
    10,Home,

    Ami fontos, hogy a categoryId,categoryName,categoryDesc ne legyen ott mert annak is fog csinálni egy rekordot 

    És így már jó lett meg vannak ezek a rekordok 
    és meg is jelenik a localhost:3000/admin/termek-kategoriak-on ezek

    Most legeneráljuk a termékeket is 
    Fontos, hogy mivel össze van csatolva a product_categories a products táblával
    és a products-on van egy olyan, hogy productCategory, ami a products_category categoryID-vel van összekötve 
    ezért annyi productCategory-t kell csinálni, ahány categoryID-van, tehát 10

    ez van products-ra 
    Field Name           Type                             Options
    productID            Row Number                       blank:0%
    productCategory      Number min: 1 max: 10  decimals: 0         blank:0%
    title                Mobile Device Brand              blank:0% 
    productName          Mobile Device Model              blank:0%
    filePath             DummyImage URL size: 400 * 400 to 400 * 400 blank:0%
    productyDesc         Words at least 10 but no more than 20       blank:0% (ez visszaad valami random szöveget a words type)ú    title                Mobile Device Brand              blank:0% 
    price                Number min: 1000 max: 150000  decimals: 0   blank:0%
    discountPrice        Number min: 500  max: 100000  decimals: 0   blank:90%
    created              Datetime  format yyyy-mm-dd      blank:0%      ***
    updated              Datetime  format yyyy-mm-dd      blank:90%     ***

    rows: 100


    így tudunk 1-10-ig számot generálni -> productCategory      Number min: 1 max: 10  decimals: 0      blank:0%
        Tehát ez véletlenszerűen be fog rakni 1-10-ig számokat, decimals az 0, mert nem akarunk ilyet, hogy 5.5 

    filePath             DummyImage URL size: 400 * 400 to 400 * 400 blank:0%
    DummyImage URL valami random képet ad vissza és ki is lehet választani, hogy milyen méretben
    
    Ezt meg ugyanígy mint a category-nál generate fields, lementjük ide a mappát az sql-be meg importáljuk 
    fontos, hogy amikor importáljuk sql-be, akkor nem kell az első sor a csv fájlból 

    Arra is érzékey, hogy pontosan ugyanannyi mezőt kell csinálni a mackaroo, mint amennyi van az sql-ben 
    ezért kell még egy created meg egy updated is 

    És megcsinálta, tehát most megjelent a legenerált 100 termék a localhost:3000/admin/termekek-nél 
    a kép viszont nem fog jól megjeleni 
    <img src="http://localhost:3000/http://dummyimage.com/....">

    a product.ejs-en, hogyha nem lenne itt ez a baseUrl 
        <% if(productData && productData.filePath) { %>
        <form method="POST" class="admin-product-img" 
        action="<%=baseUrl%/admin/delete-product-image/<%=productData.productID%>">
            <img src="<%=baseUrl%><%=productData.filePath%>"> ******************** itt

            <input type="hidden" value="<%=productData.productID%>">

            <button class="position-absolute-btn">Törlés</button>
        </form>

        <img src="<%=baseUrl%><%=productData.filePath%>">
        ->
        <img src="<%=productData.filePath%>"> 
        így jeleníti meg a képeket 
        
    Ez arra jó, hogy ne kelljen 1000 képet feltölteni a próbatermékekhez, amit utána letörlünk a tesztrendszerből 
    És most így néz ki, mondjuk az egyik localhost:3000/admin/termek/5 
    kép 
    termék kategória 
    Electronics
    termék cím 
    Sharp 
    Terméknév 
    Sharp 936SH
    Ár 
    31676
    Diszkont Ár 
    0 
    Leírás 
    valami szöveg 

    Viszont ezt a képet nem fogjuk majd tudni törölni
    *********
    Az a kérdés, hogyha van 1500 terméked, akkor meg kell oldani valamilyen lapozási mehanizmust 
    Kicsit át kell alakítani a dolgokat -> products.ejs 

    Csináltunk alulra egy form-ot, aminek adtunk egy pagination class-t 
    amiben van két button az egyik az előre másik hatulra mutató nyíl (HTML entities)
    ->
        <form class="pagination">
            <button>&lt;</button>
            <button>&gt;</button>
        </form>

    .pagination {

        display: flex;
        width: 300px;
        justify-content: space-evenly; 
        margin:auto; 
    }

    Fontos, hogy ez a grid-en kivül legyen, mert akkor a margin:auto nem teszi középre a nyílakat

    Azt szeretnénk, hogy ez át vigyen minket egy másik oldalra, ezért kell egy a-tag, aminek megadjuk ezt 
    ->
        <div class="pagination">
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page-1%>">&lt;</a>
        </button>
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page+1%>">&lt;</a>
        </button>

    Kell majd csinálni egy page változót, az első (hátrafelé nyíl át fog minket vinni a page-1, az előre meg a page+1-re)
    De ehhez meg kéne lennie a page változónak 

    Itt van nekünk amikor a termékeket lekérdezzük 
    app.get("/admin/termekek", async (req, res)=> {
    try {

    Itt kell a render-ben, hogy át tudjuk adni egy page változó, ami a req.query-ből fog lejönni 
    Ha létezik req.query.page, akkor az ha meg nem akkor 1-es 
    -> 
    app.get("/admin/termekek", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );
    
        const products = await pr.getProducts();
        const messageAndSuccess = getMessageAndSuccess(req.query);
        const page = req.query.page ? parseInt(req.query.page) : 1;  ******************
        
        res.render("admin/products", {
            layout: "./layouts/admin_layout",
            title: "Termékek",
            baseUrl: process.env.BASE_URL,
            page: "termekek",            
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            products: products,
            page:page          **************************
        })

    Ha most rámegyünk a localhost:3000/admin/termekek-re 
    Ez fog megjelenni 
    -> 
    <button>
        <a href="http://localhost:3000/admin/termekek?page=0">></a>
    </button>
    <button>
        <a href="http://localhost:3000/admin/termekek?page=2">></a>
    </button>
    A másodiknál az fog megjelenni, hogy page=2, az elsőnél meg az, hogy page=0, de az nyilván nem jó, mert az kéne legyen, hogy 1 

    Ha most rányomunk a követkkezőre (>), akkor ez fog megjelenni az url-ben és ezek lesznek a button-ök 
    localhost:3000/admin/termekek?page=2

    <button>
        <a href="http://localhost:3000/admin/termekek?page=1">></a>
    </button>
    <button>
        <a href="http://localhost:3000/admin/termekek?page=3">></a>

    Ezzel még nem lapoztunk, kizárólag csak annyit csináltunk, hogy az url változónak az értéke növekedett egyel!!! 
    Viszont itt az elsőnél (<%=page-1%>"), hogy nem mehet 0-ra vagy az alá 
    Tehát itt nem csak azt kell, hogy page-1
    Hanem ha a page > 1, akkor page-1 különben meg 1
    ->
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page > 1 ? page-1 : 1%>">&lt;</a>
        </button>

    Tehát ha ez van az url-ben, localhost:3000/admin/termekek?page=1 
    akkor a button, ami visszafele megy, akkor már nem 0-nak, hanem 1-nek kell, hogy legyen, mert nincsen olyan, hogy 0-ás oldal 
    ->
    <button>
        <a href="http://localhost:3000/admin/termekek?page=1"><</a>
    </button>

    A következő button-nél meg csak annyi lehet a page, amennyi termékünk van per(/) a limit, csak még nem csinátuk meg a limit-et 
    limit, hogy hány termék jelenleg meg egyszerre egy oldalon 

    Products.js-en van egy olyan, hogy getProducts
        async getProducts() {
        try {
                const response = await conn.promise().query(`
                    SELECT product.*, product_categories.categoryName
                    FROM products
                    INNER JOIN product_categories
                    ON products.productCategory = product_categories.categoryID`
                    )
        
                    return response[0];
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

    Ezt annyival kell kiegészíteni, hogy vár a függvény egy olyat, hogy page -> async getProducts(page)
    A response-ban, ahol leszedjük a termékeket a select-vel, ott bállítunk egy limit-et, hogy egyszerre hány termák jöjjön le 
    és lesz egy OFFSET is
        ami majd megmondja hogy hányat ugorjunk át 
    Az OFFSET egy kérdőjel lesz és az offset-et meg a page-ből ki kellene majd számolni, ezért létrehozunk egy offset változót 
    const offset = !nan(page)
    Ha nem nan a pa ge (!nan(page))
    Akkor page-1 * 8-val 
    Az elsőnél 0*8 lesz amit átugrunk, a másodiknál 1*8 lesz amit átugrunk, a harmadiknál 2*8 lesz amit átugrunk és így fog lapozni 
    különben az lesz offset, hogy 0 és ezt majd be kell dobni a response-ba 
    const offset = !nan(page) ? (page - 1) * 8 : 0;

    az egész 
        async getProducts(page **********) {
        try {
                const offset = !nan(page) ? (page - 1) * 8 : 0; *****************

                const response = await conn.promise().query(`
                SELECT product.*, product_categories.categoryName
                FROM products
                INNER JOIN product_categories
                ON products.productCategory = product_categories.categoryID
                LIMIT 8 OFFSET = ?`      **************
                [offset]                 **************
                )
    
                return response[0];

    Itt az index-en a page változó elöbbrébb kerül, hogy meg tudjuk majd adni a getProducts-nak a page-t 
    app.get("/admin/termekek", async (req, res)=> {
    try {
        checkAdminPermission(
            req.session.userID,
            req.session.isAdmin
        );
    
        const page = req.query.page ? parseInt(req.query.page) : 1; ********
        const products = await pr.getProducts(page************);
        const messageAndSuccess = getMessageAndSuccess(req.query);

    Fontos, hogy itt kell egy parseInt, hiszen az URL-ből mindig egy string-et kapunk vissza
    itt meg nekünk egy number kell majd

    Ami fontos, hogy a query string-et, hogy ?page=1, azt azzal tudjuk majd elérhetőve tenni itt -> req.query!!!
    Ha meg van egy route parameter, mint pl.itt volt sokszor, hogy :productID azt meg azzal -> req.params!!!

    Most már csak 8 terméket jelenít meg minden oldalon 
    az első oldalnak az lesz az url-e, hogy localhost:3000/admin/termekek?page=1
    Ha meg egyet lapozunk, akkor másik 8 termék fog megjelenni és ez lesz az url-ben 
    -> localhost:3000/admin/termekek?page=2

    Vissze kell még adni, hogy mennyi a maximális oldal 
    Mert jelenleg az a probléma, hogy egyszerre csak 8 termék fog lejönni (LIMIT 8) és nem tudjuk, hogy hány termék található az 
    adatbázisban, azért mert itt van egy limit-ünk, tehát mindig 8 lesz a termékeknek (tömb) a length-je
    És ezért ki van találva egy SQL_CALC_FOUND_ROWS
    -> 
    const response = await conn.promise().query(`
        SELECT SQL_CALC_FOUND_ROWS ********** product.*, product_categories.categoryName

    Ez gyakorlatilag csinál egy lekérdezést, aminek az adatait majd meg tudjuk kapni és azt fogja nekünk megmondani, hogy 
    ebben a táblában (products) hány termék található, ami a keresési feltételeknek megfelel!!!!!!!! 

    De ezt külön le kell majd kérdezni 
        const foundRowsResp = await conn.promise().query("SELECT FOUND_ROWS() AS totalRows");
        const totalRows = foundRowsResp[0][0];

    async getProducts(page) {
        try {
            const offset = !nan(page) ? (page - 1) * 8 : 0;***************

            const response = await conn.promise().query(`
            SELECT SQL_CALC_FOUND_ROWS *************product.*, product_categories.categoryName
            FROM products
            INNER JOIN product_categories
            ON products.productCategory = product_categories.categoryID
            LIMIT 8 OFFSET = ?`************
            [offset]**************
            );
    
            const foundRowsResp = await conn.promise().query("SELECT FOUND_ROWS() AS totalRows");*************
            const totalRows = foundRowsResp[0][0];************
                Ez az mondja meg, hogy hány darab termék található meg az adatbázisban 
                ami a foundRowsResp[0][0]

    

                A szokásos response mellett meg ezt is vissza kell adni, ezért egy objektumot fogunk itt visszaadni
            return {
                products: response[0],
                maxPage: Math.ceil(totalRows / 8)
                    Azért Math.ceil, azért kerekítünk felfele, mert ha van 25 darab termék, akkor az hány oldal 25/8 = 3.125 és az nem ennyi oldal
                    meg nem is 3, hanem ez 4 oldal és a 4-dik lesz még egy darab termék 
                }
    
    Itt viszont a render-nél át kell alakítani a dolgokat, mert a products az legyen productData, mert ez már egy objektum, amiben van egy 
    products meg egy maxPage 

        const page = req.query.page ? parseInt(req.query.page) : 1
        // át lett nevezve productData-ra const (products) productData = await pr.getProducts(page);
        const messageAndSuccess = getMessageAndSuccess(req.query);;  
        
        res.render("admin/products", {
            layout: "./layouts/admin_layout",
            title: "Termékek",
            baseUrl: process.env.BASE_URL,
            page: "termekek",            
            message: messageAndSuccess.message,
            success: messageAndSuccess.success,
            productData: productData,   ***** a products át lett nevezve productData-ra 
            page:page   
            
    És akkor a products.ejs-en is át kell írni a dolgokat, mert nem a products-on megyünk végig egy forEach-vel, hanem a productData.products-on
    ->
    <div class="grid">
        <% **********productData.products.forEach(p=> {  %>
            <div class="box">

    A maxPage-t meg a második (következő) button-nál kell felhasználni 
    ->
    Ha a page kisebb mint a productData.maxPage, akkor page + 1, különben meg az lesz, hogy productData.maxPage 
        <div class="pagination">
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page > 1 ? page-1 : 1%>">&lt;</a>
        </button>
        <button> ******************************
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page < productData.maxPage ? page+1 : productData.maxPage>">&lt;</a>
        </button>

    Hogy ne tudjunk túllépni azon, hogy hány oldalnyi termékünk van!!! 

    Itt van egy olyan probléma, hogy amit visszaadunk az maxPage az NaN lett 
    és azért mert nem az kell visszaadni, hogy 
    const totalRows = foundRowResp[0][0];
    hanem itt a totalRows-t
    const totalRows = foundRowResp[0][0].totalRows;

    const foundRowsResp = await conn.promise().query("SELECT FOUND_ROWS() AS totalRows");**** mert itt ezzel a névvel illetük ez a dolgot (totalRows)
    const totalRows = foundRowsResp[0][0].totalRows;

    Fontos váloztatás, ez nem egy form-ban lesz a pagination, hanem egy sima div-ben, mert a form-ot beküldi 
    <div*** class="pagination">
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page > 1 ? page-1 : 1%>">&lt;</a>
        </button>
        <button>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page < productData.maxPage ? page+1 : productData.maxPage>">&lt;</a>
        </button>
    </div***>

    Ezt nem kell berakni egy form-ba, mert a form-ot elküldi ha button-re kattintunk!!! 
    És nem tudja, hogy link-et vegye figyelembe vagy a form-ot amit beküldtünk, egyébként teljesen üresen 

    Van egy limit és nem tudunk a 13-nál oldalnál tovább menni 
    ->
        <button>
        <a href="http://localhost:3000/admin/termekek?page=11">></a>
    </button>
    <button>
        <a href="http://localhost:3000/admin/termekek?page=13">></a>
    </button>

    Azért nem tölti újra az oldalt, az nem mindegy, hogy az &lt-re kattintunk erre a kis szövegre, akkor fogja csak, mert az van benne 
    az a-tag-ben!! 

    Ha azt akarjuk, hogy az egész button-re kattintva töltse újra, akkor a teljes button-t kell berakni az a-ba
    ->
        <div class="pagination">
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page > 1 ? page-1 : 1%>">
                <button>
                    &lt;
                </button>
            </a>
            <a href="<%=baseUrl%>/admin/termekek?page=<%=page < productData.maxPage ? page+1 : productData.maxPage>">
                <button>
                    &lt;
                </button>
            </a>

    Mert a link-nek a horgonyszövege az konkrétan az &lt; meg az &gt; volt 

    És most nem erre a kis <>-re kell kattintani a button-on belül hanem az egész button-ra tudunk és akkor váltani fog meg újratölteni 

    localhost:3000/admin/termekek?page=1
    kattintás 
    localhost:3000/admin/termekek?page=2
    kattintás
    localhost:3000/admin/termekek?page=3 ... 

*/

