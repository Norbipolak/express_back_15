import nullOrUndefined from "./nullOrUndefined.js";

function checkAdminPermission(userID, isAdmin) {
    if(nullOrUndefined(userID) || nullOrUndefined(isAdmin) || isAdmin == 0) {
        throw {
            status: 403,
            message: "Jelentkezz be a tartalom megtekintéséhez!"
        }
    }
}

export default checkAdminPermission;

/*
    Ez nagyon hasonló, mint a checkPermission, csak ez nem csak a userID-t, hanem egy isAdmin is vár!!
    ->
    function checkAdminPermission(userID, isAdmin)

*/