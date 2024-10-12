function successHTTP(status) {
    //response.success = response.status.toString()[0] === "2"; ez volt az eredeti dolog, amit meg akarunk oldani ezzel a függvénnyel 
    return status.toString()[0] === "2";
}

export default successHTTP;