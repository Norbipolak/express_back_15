import nullOrUndefined from "./nullOrUndefined.js";

function checkPermission(userID) {
    if(nullOrUndefined(userID)) {
        throw {
            status: 403,
            message: "Jelentkezz be a tartalom megtekintéséhez!"
        }
    }
}

export default checkPermission;