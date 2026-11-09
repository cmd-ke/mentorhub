export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        })

        if(!result.success){
            return next(result.error)
        }

        // Use Object.assign to mutate the properties inside the container safely
        if (result.data.body) Object.assign(req.body, result.data.body);
        if (result.data.params) Object.assign(req.params, result.data.params);
        if (result.data.query) Object.assign(req.query, result.data.query);

        return next();
    }
}
