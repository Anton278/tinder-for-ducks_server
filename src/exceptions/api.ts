class ApiException extends Error {
  status;

  constructor(status: number, message: string = "") {
    super(message);
    this.status = status;
  }

  static unauthorized() {
    return new ApiException(401, "Unauthorized user");
  }

  static accessTokenFormat() {
    return new ApiException(
      401,
      "Access-Token header must follow format: 'Bearer <token>'"
    );
  }

  static documentNotFound() {
    return new ApiException(404, "Document not found");
  }
}

export default ApiException;
