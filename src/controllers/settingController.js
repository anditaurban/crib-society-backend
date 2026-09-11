import { pool } from '../config/db.js';

export class SettingController {
  /**
   * GET /api/settings
   */
  static async getSettings(req, res, next) {
    try {
      const [rows] = await pool.query(
        'SELECT id, setting_key AS settingKey, setting_value AS settingValue, data_type AS dataType, description FROM store_settings'
      );

      const settingsMap = {};
      for (const row of rows) {
        let val = row.settingValue;
        if (row.dataType === 'number') {
          val = parseFloat(row.settingValue) || 0;
        } else if (row.dataType === 'boolean') {
          val = row.settingValue === 'true' || row.settingValue === '1';
        } else if (row.dataType === 'json') {
          try {
            val = JSON.parse(row.settingValue);
          } catch (e) {
            val = row.settingValue;
          }
        }
        settingsMap[row.settingKey] = val;
      }

      res.status(200).json({
        success: true,
        data: settingsMap,
        raw: rows
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/settings (Owner only)
   */
  static async updateSettings(req, res, next) {
    try {
      const settings = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Payload must be a key-value object of settings.'
        });
      }

      for (const [key, value] of Object.entries(settings)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await pool.query(
          `INSERT INTO store_settings (setting_key, setting_value, updated_at)
           VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
          [key, valStr]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
