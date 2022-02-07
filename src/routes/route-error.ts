/**
 * @api {post} on-route-error Route Error Handling
 * @apiDescription Route Error: When the route fails we return status code 500 with this information. We generally only return 500/200
 * @apiName RouteError
 * @apiGroup AA Info
 * @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 500
 *   {
 *     statusCode: "UserNotFound",
 *     "details": "The user was not found",
 *   }
 **/
export class RouteError {
    isRouteError: boolean;
    statusCode: string;
    details: string;
    /**
     * Logged for server side stuff.
     */
    meta?: any;
    /**
     * Logged for the client.
     */
    clientData?: any;

    logAsInfo?: boolean;

    constructor(statusCode: string, details: string, extra?: { meta?: any; clientData?: any; logAsInfo?: boolean }) {
        this.details = details;
        this.meta = extra?.meta;
        this.clientData = extra?.clientData;
        this.statusCode = statusCode;
        this.isRouteError = true;
        this.logAsInfo = extra?.logAsInfo ?? false;
    }
}
