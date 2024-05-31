const codeMessage = {
  200: 'El servidor devolvió exitosamente los datos solicitados.',
  201: 'Crear o modificar datos exitosamente.',
  202: 'Una solicitud ha ingresado a la cola en segundo plano (tarea asíncrona).',
  204: 'Eliminar datos exitosamente.',
  400: 'Hubo un error en la solicitud enviada y el servidor no creó ni modificó datos.',
  401: 'El administrador no tiene permisos, por favor, intenta iniciar sesión nuevamente.',
  403: 'El administrador está autorizado, pero el acceso está prohibido.',
  404: 'La solicitud enviada es para un registro que no existe y el servidor no está operando.',
  406: 'El formato solicitado no está disponible.',
  410: 'El recurso solicitado ha sido eliminado permanentemente y ya no estará disponible.',
  422: 'Al crear un objeto, ocurrió un error de validación.',
  500: 'Ocurrió un error en el servidor, por favor, verifica el servidor.',
  502: 'Error de puerta de enlace.',
  503: 'El servicio no está disponible, el servidor está temporalmente sobrecargado o en mantenimiento.',
  504: 'Tiempo de respuesta largo en el servidor. ',
};

export default codeMessage;
