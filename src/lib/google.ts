import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';
import { JWT } from 'google-auth-library';
/**
 * This class provides utility functions to interact with Google Sheets
 *
 * @param config The adapter configuration
 * @param log The logger
 */
export class SpreadsheetUtils {
    /**
     * Constructor
     *
     * @param config The adapter configuration
     * @param log The logger
     */
    public constructor(
        private config: ioBroker.AdapterConfig,
        private log: ioBroker.Log,
    ) {}

    /**
     * Delete rows from a Google Spreadsheet
     *
     * @param sheetName Name of the sheet
     * @param start First row to delete
     * @param end Last row to delete
     */
    public deleteRows(sheetName: string, start: number, end: number): void {
        const sheets = this.init();

        sheets.spreadsheets
            .get({ spreadsheetId: this.config.spreadsheetId })
            .then(spreadsheet => {
                if (spreadsheet && spreadsheet.data.sheets) {
                    const sheet = spreadsheet.data.sheets.find(
                        sheet => sheet.properties && sheet.properties.title == sheetName,
                    );
                    if (sheet && sheet.properties) {
                        const sheetId = sheet.properties.sheetId;
                        sheets.spreadsheets
                            .batchUpdate({
                                spreadsheetId: this.config.spreadsheetId,
                                requestBody: {
                                    requests: [
                                        {
                                            deleteDimension: {
                                                range: {
                                                    dimension: 'ROWS',
                                                    endIndex: end,
                                                    sheetId: sheetId,
                                                    startIndex: start - 1,
                                                },
                                            },
                                        },
                                    ],
                                },
                            })
                            .then(() => {
                                this.log.debug('Rows successfully deleted from google spreadsheet');
                            })
                            .catch(error => {
                                this.log.error(`Error while deleting rows from Google Spreadsheet:${error}`);
                            });
                    }
                }
            })
            .catch(error => {
                this.log.error(`Error while deleting rows from Google Spreadsheet:${error}`);
            });
    }

    private init(): sheets_v4.Sheets {
        const auth = new JWT({
            email: this.config.serviceAccountEmail,
            key: this.formatPrivateKey(this.config.privateKey),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return google.sheets({ version: 'v4', auth });
    }

    /**
     * Create a new sheet in the Google Spreadsheet
     *
     * @param title The title of the new sheet
     */
    public createSheet(title: string): void {
        const sheets = this.init();

        sheets.spreadsheets
            .batchUpdate({
                spreadsheetId: this.config.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: title,
                                },
                            },
                        },
                    ],
                },
            })
            .then(() => {
                this.log.debug('Sheet created successfully');
            })
            .catch(error => {
                this.log.error(`Error while creating sheet:${error}`);
            });
    }

    /**
     * Duplicate a sheet in the Google Spreadsheet
     *
     * @param source Name of the source sheet
     * @param target Name of the target sheet
     * @param index Position of the new sheet
     */
    public duplicateSheet(source: string, target: string, index: number): void {
        const sheets = this.init();

        sheets.spreadsheets
            .get({ spreadsheetId: this.config.spreadsheetId })
            .then(spreadsheet => {
                if (spreadsheet && spreadsheet.data.sheets) {
                    const sheet = spreadsheet.data.sheets.find(
                        sheet => sheet.properties && sheet.properties.title == source,
                    );
                    if (sheet && sheet.properties) {
                        let insertIndex = index;
                        if (insertIndex == -1 || insertIndex == undefined) {
                            insertIndex = spreadsheet.data.sheets.length;
                        }
                        sheets.spreadsheets
                            .batchUpdate({
                                spreadsheetId: this.config.spreadsheetId,
                                requestBody: {
                                    requests: [
                                        {
                                            duplicateSheet: {
                                                sourceSheetId: sheet.properties.sheetId,
                                                newSheetName: target,
                                                insertSheetIndex: insertIndex,
                                            },
                                        },
                                    ],
                                },
                            })
                            .then(() => {
                                this.log.debug('Data successfully sent to google spreadsheet');
                            })
                            .catch(error => {
                                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
                            });
                    } else {
                        this.log.warn(`Cannot find sheet: ${source}`);
                    }
                }
            })
            .catch(error => {
                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
            });
    }

    /**
     * Upload a file to the Google Drive
     *
     * @param target Name of the target file
     * @param parentFolder Name of the parent folder
     * @param filecontent Data of the file
     */
    public upload(target: string, parentFolder: string, filecontent: any): void {
        const auth = new JWT({
            email: this.config.serviceAccountEmail,
            key: this.config.privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        const driveapi = google.drive({ version: 'v3', auth });

        driveapi.files
            .create({
                requestBody: {
                    parents: [parentFolder],
                    name: target,
                },
                media: {
                    mimeType: 'application/octet-stream',
                    body: filecontent,
                },
                fields: 'id',
            })
            .then(() => {
                this.log.debug('Data successfully uploaded to google spreadsheet');
            })
            .catch(error => {
                this.log.error(`Error while uploading data to Google Spreadsheet:${error}`);
            });
    }

    /**
     * Delete a sheet from the Google Spreadsheet
     *
     * @param title The title of the sheet to delete
     */
    public deleteSheet(title: string): void {
        const sheets = this.init();

        sheets.spreadsheets
            .get({ spreadsheetId: this.config.spreadsheetId })
            .then(spreadsheet => {
                if (spreadsheet && spreadsheet.data.sheets) {
                    const sheet = spreadsheet.data.sheets.find(
                        sheet => sheet.properties && sheet.properties.title == title,
                    );
                    if (sheet && sheet.properties) {
                        sheets.spreadsheets
                            .batchUpdate({
                                spreadsheetId: this.config.spreadsheetId,
                                requestBody: {
                                    requests: [
                                        {
                                            deleteSheet: {
                                                sheetId: sheet.properties.sheetId,
                                            },
                                        },
                                    ],
                                },
                            })
                            .then(() => {
                                this.log.debug('Data successfully sent to google spreadsheet');
                            })
                            .catch(error => {
                                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
                            });
                    }
                }
            })
            .catch(error => {
                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
            });
    }

    /**
     * Send data to a Google Spreadsheet
     *
     * @param sheetName Name of the sheet
     * @param data Data to send
     */
    public append(sheetName: string, data: any): void {
        const sheets = this.init();

        sheets.spreadsheets.values
            .append({
                // The [A1 notation](/sheets/api/guides/concepts#cell) of a range to search for a logical table of data. Values are appended after the last row of the table.
                range: sheetName,
                spreadsheetId: this.config.spreadsheetId,
                valueInputOption: 'USER_ENTERED',
                // Request body metadata
                requestBody: {
                    values: this.prepareValues(data),
                },
            })
            .then(() => {
                this.log.debug('Data successfully sent to google spreadsheet');
            })
            .catch(error => {
                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
            });
    }

    /**
     * Write data to a cell in a Google Spreadsheet
     *
     * @param sheetName Name of the sheet
     * @param cell Cell to write to
     * @param data Data to write
     */
    public writeCell(sheetName: string, cell: string, data: any): void {
        const sheets = this.init();
        if (cell.startsWith("'") && cell.endsWith("'")) {
            cell = cell.substring(1, cell.length - 1);
        }

        sheets.spreadsheets.values
            .batchUpdate({
                spreadsheetId: this.config.spreadsheetId,
                requestBody: {
                    valueInputOption: 'USER_ENTERED',
                    data: [
                        {
                            range: `${sheetName}!${cell}`,
                            values: this.prepareValues(data),
                        },
                    ],
                },
            })
            .then(() => {
                this.log.debug('Data successfully sent to google spreadsheet');
            })
            .catch(error => {
                this.log.error(`Error while sending data to Google Spreadsheet:${error}`);
            });
    }

    /**
     * Read data from a cell in a Google Spreadsheet
     *
     * @param sheetName Name of the sheet
     * @param cell Cell to read from
     * @returns The data from the cell
     */
    public async readCell(sheetName: string, cell: string): Promise<any> {
        const sheets = this.init();
        return new Promise<any>((resolve, reject) => {
            if (cell.startsWith("'") && cell.endsWith("'")) {
                cell = cell.substring(1, cell.length - 1);
            }
            sheets.spreadsheets.values
                .get({
                    range: `${sheetName}!${cell}`,
                    spreadsheetId: this.config.spreadsheetId,
                })
                .then(response => {
                    this.log.debug('Data successfully retrieved from google spreadsheet');
                    if (response.data.values && response.data.values.length > 0) {
                        resolve(response.data.values[0][0]);
                    } else {
                        reject(new Error('No data found'));
                    }
                })
                .catch(error => {
                    this.log.error(`Error while retrieving data from Google Spreadsheet:${error}`);
                    reject(new Error(`Error while retrieving data from Google Spreadsheet: ${error.message}`));
                });
        });
    }
    private prepareValues(message: any): any {
        if (Array.isArray(message)) {
            return [message];
        }
        return [[message]];
    }
    private formatPrivateKey(privateKey: string): string | undefined {
        //replace all \n with line breaks
        if (privateKey) {
            return privateKey.replace(/\\n/g, '\n');
        }
        return undefined;
    }
}
