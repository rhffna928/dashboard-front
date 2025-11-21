enum ResponseCode {

  // HTTP Status 200
  SUCCESS= "SU",

  // HTTP Status 400
  VALIDATION_FAILED= "VF",
  DUPLICATE_ID= "DI",
  NOT_EXISTED_USER= "NU",

  // HTTP Status 401
  SIGN_IN_FAIL= "SF",
  AUTHORIZATION_FAIL= "AF",

  // HTTP Status 403
  NO_PERMISSION= "NP",

  // HTTP Status 500
  DATABASE_ERROR= "DBE",

}

export default ResponseCode;