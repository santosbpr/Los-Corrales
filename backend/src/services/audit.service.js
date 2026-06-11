const supabase = require('../config/supabase');

const AuditService = {
  async log(userEmail, action, details) {
    try {
      await supabase.from('audit_logs').insert([{
        user_email: userEmail || 'SISTEMA_AUTOMATICO',
        action: action,
        details: typeof details === 'object' ? JSON.stringify(details) : details
      }]);
    } catch (err) {
      // Falhas no log de auditoria não devem travar a aplicação, mas precisam ser exibidas no console
      console.error("CRÍTICO: Falha ao salvar log de auditoria no banco:", err);
    }
  }
};

module.exports = AuditService;