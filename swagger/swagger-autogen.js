const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Digital Recipe Box",
    description: "."
  },
  host: '',
  schemes: ['https','http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['../routes/index.js'];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);