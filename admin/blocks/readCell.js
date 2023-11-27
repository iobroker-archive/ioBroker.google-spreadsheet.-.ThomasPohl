"use strict";

/// --- Read Cell  --------------------------------------------------

Blockly.Words["google-spreadsheet_read_read-from"] = { en: "read from", de: "Lies von" }
Blockly.Words["google-spreadsheet_read_on-sheetName"] = { en: "sheet", de: "Tabellenblatt" }
Blockly.Words["google-spreadsheet_read_on-range"] = { en: "cell", de: "aus Zelle" }

Blockly.Sendto.blocks["google-spreadsheet.read"] =
    '<block type="google-spreadsheet.read">' +
    '     <value name="NAME">' +
    '     </value>' + 
    '     <value name="INSTANCE">' +
    '     </value>' +
    '     <value name="SHEET_NAME">' +
    '         <shadow type="text">' +
    '             <field name="TEXT">text</field>' +
    '         </shadow>' +
    '     </value>' +
    '     <value name="RANGE">' +
    '         <shadow type="text">' +
    '             <field name="TEXT">text</field>' +
    '         </shadow>' +
    '     </value>' +
    '</block>';

    Blockly.Blocks["google-spreadsheet.read"] = {
        init: function () {
            const instances = getInstances();
    
            this.appendDummyInput("NAME")
                .appendField(Blockly.Translate("google-spreadsheet_read_write-to"))
                .appendField(new Blockly.FieldDropdown(instances), "INSTANCE");
    
                this.appendValueInput("SHEET_NAME")
                .appendField(Blockly.Translate("google-spreadsheet_read_on-sheetName"));
    
                this.appendValueInput("RANGE")
                .appendField(Blockly.Translate("google-spreadsheet_read_in-cell"));
    
            this.appendValueInput("DATA")
                .appendField(Blockly.Translate("google-spreadsheet_read_data"));
    
            this.appendDummyInput()
                .appendField(Blockly.Translate("google-spreadsheet_read_add-to-suffix"));
    
            this.setInputsInline(true);
            this.setPreviousStatement(false, null);
            this.setNextStatement(falsr, null);
    
            this.setColour(Blockly.Sendto.HUE);

        },
    };
    
    Blockly.JavaScript["google-spreadsheet.read"] = function (block) {
        var dropdown_instance = block.getFieldValue("INSTANCE");
        var data = Blockly.JavaScript.valueToCode(block, "DATA", Blockly.JavaScript.ORDER_ATOMIC);
        if (!data){
            data = "{}";
        }
        var sheetName = Blockly.JavaScript.valueToCode(block, "SHEET_NAME", Blockly.JavaScript.ORDER_ATOMIC);
        var range = Blockly.JavaScript.valueToCode(block, "RANGE", Blockly.JavaScript.ORDER_ATOMIC);
    
        return 'sendTo("google-spreadsheet' + dropdown_instance + '", "read", {"sheetName":'+sheetName+', "range":'+range+', "data":' + data + "});\n";
    };

