/**
 * Flow Routes for WhatsApp Flow Demo
 *
 * Defines API endpoints for WhatsApp Flow integration
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/whatsapp-flow-demo/endpoint',
      handler: 'flow-controller.handle',
      config: {
        auth: false, // WhatsApp Cloud API doesn't use Strapi auth
        policies: [],
        middlewares: []
      }
    }
  ]
};
