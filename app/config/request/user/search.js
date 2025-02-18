module.exports = {
    body: {
        text: {
            type: "string",
            required: true,
            minLength: 1,
            maxLength: 100,
        },
    },
}