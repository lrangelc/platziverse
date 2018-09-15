'use strict';

class AgentNotFoundError extends Error {
  constructor (givenUuid, ...params) {
    super(...params);

    this.givenUuid = givenUuid;
    this.code = 404;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError);
    }

    this.message = `Agent with UUID: ${givenUuid} not found in DataBase`;
  }
}

class MetricsNotFoundError extends Error {
  constructor (givenUuid, type, ...params) {
    super(...params);

    this.givenUuid = givenUuid;
    this.type = type || null;
    this.code = 404;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MetricsNotFoundError);
    }

    this.message = (type) ? `Metrics of Agent with UUID: ${givenUuid} and type: ${type} not found in DataBase` : `Agent with UUID: ${givenUuid} not Found in DataBase`;
  }
}

class NotAuthorizedError extends Error {
  constructor (...params) {
    super(...params);

    this.code = 403;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthorizedError);
    }

    this.message = `This user is not authorized to access the requested content`;
  }
}

class NotAuthenticatedError extends Error {
  constructor (givenUuid, ...params) {
    super(...params);

    this.givenUuid = givenUuid;
    this.code = 401;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthenticatedError);
    }

    this.message = `User is not authenticated`;
  }
}

module.exports = {AgentNotFoundError, NotAuthenticatedError, NotAuthorizedError, MetricsNotFoundError};
