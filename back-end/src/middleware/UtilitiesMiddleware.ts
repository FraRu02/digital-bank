import { type AuthRequest } from "@/controllers/AuthController";
import { type UserRole } from "@/models/UserModel";
import { type NextFunction, type Request, type Response } from "express";
import * as z from "zod";

/**
 * Middleware per validare lo schema di una request
 * @param schema - schema Zod (ZodObject, ZodUnion, ZodArray)
 * @returns middleware Express
 *
 * Uso:
 * router.post("/route", validateSchema(schema), controllerFunction);
 */
export const validateSchema = <T extends AuthRequest>(
  schema: z.ZodObject<any> | z.ZodUnion<any> | z.ZodArray<any>
) => {
  return async (req: T, res: Response, next: NextFunction) => {
    // Validazione asincrona del body
    const result = await schema.safeParseAsync(req.body);

    // Se fallisce, ritorna 400 con messaggio di errore strutturato
    if (!result.success) {
      res.status(400).send(z.treeifyError(result.error));
      return;
    }

    // Sostituisce il body con i dati validati e tipati
    req.body = result.data;
    next();
  };
};

/**
 * Middleware per controllare i permessi di un utente
 * @param userRoles - array di ruoli permessi
 * @returns middleware Express
 *
 * Uso:
 * router.get("/admin", hasUserPermissions([UserRole.admin]), controllerFunction);
 */
export const hasUserPermissions = (userRoles: Array<UserRole>) => {
  return async (
    req: AuthRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    // Estrae il ruolo dell'utente dalla request (popolata da AuthMiddleware)
    const userRole = req.user!.role;

    // Controlla se il ruolo è permesso
    const permission = userRoles.includes(userRole);

    if (!permission) {
      // Se non ha permessi, ritorna 401 Unauthorized
      res?.sendStatus(401);
      throw new Error("No user permission");
    }

    // Passa al middleware successivo
    next?.();
  };
};