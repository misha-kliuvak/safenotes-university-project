import * as fs from 'fs';
import handlebars from 'handlebars';
import { join } from 'path';

import { IUrlConfig } from '@/config/app-config/url.config';
import { templateDir } from '@/directories';
import { HandlebarOperators } from '@/shared/common/hbs.operators';
import { Dictionary } from '@/shared/types';

/**
 *
 * @return minified html string
 * @param config url config
 * @param templateName
 * @param context
 */
export async function minifyAndConvertTemplateToHtml(
  config: IUrlConfig,
  templateName: string,
  context?: Dictionary,
): Promise<string> {
  try {
    const templateSource = fs.readFileSync(
      join(templateDir, templateName + '.hbs'),
      'utf-8',
    );

    // Register all the helpers in the handlebarsHelpers object
    Object.keys(HandlebarOperators).forEach((helperName) => {
      handlebars.registerHelper(helperName, HandlebarOperators[helperName]);
    });

    const { staticFolderUrl, loginUrl, dashboardUrl } = config;

    const template = handlebars.compile(templateSource);
    return template({
      staticFolderUrl,
      loginUrl,
      dashboardUrl,
      ...context,
    });
  } catch (error) {
    throw new Error('Cannot convert to html:' + error);
  }
}
