import { Request, Response, NextFunction } from "express";

import ApiException from "../exceptions/api";
import tokensService from "../services/tokens";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "OPTIONS") {
    next();
  }
  const accessTokenHeader = req.headers["access-token"];
  if (typeof accessTokenHeader !== "string") {
    return next(ApiException.unauthorized());
  }
  const accessToken = accessTokenHeader.split(" ")[1];
  if (!accessToken) {
    return next(ApiException.accessTokenFormat());
  }
  try {
    const payload = tokensService.validateAccessToken(accessToken);
    if (typeof payload !== "string") {
      // @ts-ignore
      req.user = { id: payload.subject };
    }

    next();
  } catch (err) {
    next(ApiException.unauthorized());
  }
}
