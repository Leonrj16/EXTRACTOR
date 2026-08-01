# Dominio personalizado

Un perfil puede reclamar un dominio propio (`Profile.customDomain`) y
probar que lo controla vía un registro DNS TXT. Esta carpeta documenta
exactamente hasta dónde llega esa función y por qué se corta ahí.

## Lo que esto SÍ hace

1. El dueño del perfil pone su dominio en `POST /admin/profile/custom-domain
   { domain }`. El backend genera un token aleatorio
   (`Profile.customDomainToken`) y lo guarda junto al dominio —
   `customDomainVerifiedAt` se limpia (cambiar de dominio siempre exige
   re-verificar, el token viejo probaba control del dominio viejo, no del
   nuevo).
2. La UI le muestra al dueño qué registro TXT publicar:
   `_aura-verify.<su-dominio>` → el valor de `customDomainToken`. Es el
   mismo patrón que usan Google Search Console, Vercel, etc. para probar
   propiedad de un dominio sin necesitar acceso a nada más que el DNS.
3. `POST /admin/profile/custom-domain/verify` hace un lookup real de
   registros TXT (`node:dns/promises resolveTxt`) sobre
   `_aura-verify.<dominio>` y compara contra el token guardado. Si coincide,
   marca `customDomainVerifiedAt = now()`.

`customDomainToken` **no se trata como secreto** — a diferencia de
`pagePasswordHash`, el dueño necesita verlo y copiarlo a su proveedor de
DNS, así que `ProfilesService` se lo devuelve en las respuestas
autenticadas del propio dueño (nunca a un visitante público —
`PublicService` sí lo excluye).

## Lo que esto NO hace (y por qué no está acá)

Verificar que alguien controla un dominio es una cosa; **hacer que ese
dominio realmente sirva esta aplicación** es otra completamente distinta,
y es infraestructura que vive fuera de este repo:

- **Ruteo**: algo tiene que recibir tráfico HTTP(S) para
  `midominio.com` y reenviarlo a esta app con el `Host` correcto para que
  `PublicService` sepa qué perfil devolver. Eso es un proxy/edge (Nginx,
  Cloudflare, un load balancer) al que hay que darle de alta cada dominio
  verificado — no algo que un proceso Node de una sola instancia pueda
  hacer por sí mismo sin ese componente.
- **Certificados TLS**: cada dominio verificado necesita su propio
  certificado (Let's Encrypt vía ACME, o el gestor de certificados del
  proveedor de hosting). Emitir y renovar certificados para dominios de
  terceros es un servicio aparte, no lógica de aplicación.
- **DNS del lado del visitante**: el dueño del dominio también tiene que
  apuntar su registro A/CNAME hacia donde sea que corra el proxy de arriba
  — un paso manual de su lado que ninguna cantidad de código en este repo
  puede automatizar.

Este sandbox de desarrollo no tiene ese proxy ni gestión de certificados,
así que ese tramo no se construyó ahí — construirlo sin la infraestructura
real detrás habría sido simular una función que no funciona. Lo que sí se
construyó (el modelo de datos completo y la verificación de propiedad vía
DNS) es exactamente el trabajo de aplicación real que un proxy de dominios
personalizados necesitaría consultar (`¿este dominio está verificado y a
qué perfil pertenece?`) el día que se agregue esa pieza de infraestructura.
