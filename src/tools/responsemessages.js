export const messageInternalError = {
  status: 500,
  message: "Server internal error"
};

export const messageNotFound = {
  status: 404,
  message: "Not found"
};

export const messageMissingQuery = {
  status: 400,
  description: 'Missing parameters'
}

export function messageGenerate(error) {
  const message = {}
  if (error.status !== undefined) {
    message.status = error.status;
    message.description = error.description !== undefined && error.description;
    return message;
  }
  return messageInternalError;
}