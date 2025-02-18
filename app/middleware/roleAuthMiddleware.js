const jwt = require("jsonwebtoken");

const roleAuthMiddleware = {};
roleAuthMiddleware.init = () => {

	const hasPermission = async (req, res, next) => {

		if (req.type_required.includes(req.body.type)){
			next();
		} else {
			res.status(401).send({
				status: false,
				message: `You do not have correct permission to do this operation.`
			});
		}
	}

	return {
		hasPermission,
	};
}

module.exports = roleAuthMiddleware;

