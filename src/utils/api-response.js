class ApiResponse {
  constructor(statusCode, data, message = "Success", meta = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
    if (meta) {
      this.meta = meta;
    }
  }
}

export default ApiResponse;
