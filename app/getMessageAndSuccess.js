function getMessageAndSuccess(query) {
    return {
        message: query.message ? query.message.split(",") : [],
        success: query.success ? query.success === "true": true
    }
}

export default getMessageAndSuccess;

/*
    message: req.query.message ? req.query.message.split(",") : [],
    success: req.query.success ? req.query.success === "true": true

Erre csináltuk ezt a segédfüggvényt 
Tehát vár majd egy query-t -> function getMessageAndSuccess(query)

    
*/