import "@typespec/http";
using TypeSpec.Http;

//
// Scalars
//

// uuid
@format("uuid")
scalar uuid extends string;


//
// Error Responses
//
@error
model Error {
  @statusCode statusCode: 500;
  status: int32;
  title: string;
}

@error
model NotFoundError {
  @statusCode statusCode: 404;
  status: int32;
  title: string;
}

@error
model NotAuthorizedError {
  @statusCode statusCode: 401;
  status: int32;
  title: string;
}

@error
model ForbiddenError {
  @statusCode statusCode: 403;
  status: int32;
  title: string;
}

@error
model BadRequestError {
  @statusCode statusCode: 400;
  status: int32;
  title: string;
  errors: ErrorDetail[];
}

model ErrorDetail {
  key: string;
  message: string;
}
