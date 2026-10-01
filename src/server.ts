import { createProductionApplication } from "./composition";
const application = createProductionApplication();
const server = application.app.listen(3000, () => console.log("Mini-Prontuário T3 no ar em http://localhost:3000"));
function shutdown() { server.close(() => { void application.close(); }); }
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
