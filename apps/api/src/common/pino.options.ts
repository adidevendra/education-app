export const pinoOptions = {
  pinoHttp: {
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    genReqId: (req: any) => req.id || req.headers['x-request-id'] || undefined,
    serializers: {
      req: (req: any) => ({ method: req.method, url: req.url }),
    },
  },
};
