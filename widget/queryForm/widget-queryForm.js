/*
* Copyright (c) 4D, 2011
*
* This file is part of Wakanda Application Framework (WAF).
* Wakanda is an open source platform for building business web applications
* with nothing but JavaScript.
*
* Wakanda Application Framework is free software. You can redistribute it and/or
* modify since you respect the terms of the GNU General Public License Version 3,
* as published by the Free Software Foundation.
*
* Wakanda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* Licenses for more details.
*
* You should have received a copy of the GNU General Public License version 3
* along with Wakanda. If not see : http://www.gnu.org/licenses/
*/
/*
 * AUTOFORM USING WIDGET'S PROVIDE
 */
WAF.Widget.provide(
    'QueryForm',    
    {
    },
    function WAFWidget(config, data, shared) {
        var
        source,
        nameList,
        attrList,
        mustDisplayError,
        divID,
        options,
        htmlObject;
        
        htmlObject          = $(this.containerNode);
        source              = WAF.source[config['data-binding']];
        nameList            = [];
        attrList            = [];
        mustDisplayError    = config['data-display-error'];
        divID               = config['id'];
        options             = {};

        if (mustDisplayError == null) {
            mustDisplayError = true;
        } else {
            mustDisplayError = (mustDisplayError == '1' || mustDisplayError == 'true');
        }
        
        options.mustDisplayError    = mustDisplayError;
        options.isQueryForm         = true;        
        options.queryData           = this.queryData = config.queryData;

        if (source != null) {
            /*
             * Getting the names list
             */
            if(data['column-name']) {
                nameList = data['column-name'].split(',')
            }

            /*
             * Getting the attributes list
             */
            if(data['column-attribute']) {
                attrList = data['column-attribute'].split(',')
            }

            if (data['columns'] != null && data['columns'] != '' && !data['column-name'] ) {
                attrList = data['columns'].split(',');
                nameList = data['columns'].split(',');
            }
            
            /*
             * Call queryform build method
             */            
            WAF.AF.buildForm(divID, source, attrList, nameList, options);                       
            
            /*
             * DEPRECATED AFTER REFACTORING
             */
            WAF.widgets[this.id] = this;
        /*
         * Display a message to indicate that the widget is not binded
         */
        } else {
            
            htmlObject.addClass('waf-autoForm')
            $('<div class="waf-autoForm-missingBinding" style="top:20px;">Datasource is either missing <br>or <br>invalid</div>').appendTo(htmlObject);
        }
        
        if (data.draggable == 'true') {
            htmlObject.find('.waf-widget-header,.waf-widget-footer').css('cursor', 'pointer');
        }
    }, {       
        /*
         * Resize method called during resize
         * @method onResize
         */
        onResize : function queryform_resize() {  
            var
            width,
            height,
            newHeight,
            htmlObject;
            
            /*
             * Resize autoform body
             */
            htmlObject  = $(this.containerNode);
            width       = htmlObject.width();
            height      = htmlObject.height();            
            newHeight   = height - parseInt(htmlObject.find('.waf-widget-footer').css('height'));
            newHeight  -= parseInt(htmlObject.find('.waf-widget-header').css('height'));
            
            htmlObject.find('.waf-widget-body').css('width', width);
            
            htmlObject.find('.waf-widget-body').css('height',  newHeight + 'px');        
        },
        
        /*
         * Resize method called on stop resize
         * @method onResize
         */
        stopResize : function queryform_stop_resize() {   
        },  
               
        /*
         * Clear the queryform content
         * @method clear
         */
        clear   : function queryform_clear() {
            var 
            i,
            attList,
            att,
            xLength;

            attList = this.attList;

            this.purgeErrorMessagesOnForm();    

            for (i = 0; i < attList.length; i++) {
                att = this.atts[i];

                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias"){
                    document.getElementById(this.id + "_" + idName(attList[i])).value = "";
                }
            }

            if (this.withToolBar) {
                xLength = this.source.length;
                $('#' + this.id + ' .waf-status-right').html(xLength);
            }     
        },
        
        
        /*
         * Fill the queryform content
         * @method fill
         */
        fill : function queryform_fill() {
            var
            eset,
            xLength;

            this.purgeErrorMessagesOnForm();

            if (this.withToolBar)  {
                eset    = this.source.getEntityCollection();
                xLength = (eset != null) ? eset.length : 0;

                $('#' + this.id + ' .waf-status-right').html(xLength);
            }
        },
        
        /*
         * Draw the status(pager) of the queryform in the footer
         * @method drawStatud
         */
        drawStatus : function queryform_draw_status() {
            var
            xLength;
            
            xLength = this.source.length;
            
            $('#' + this.id + ' .waf-status-right').html(xLength);
        },
        
        /*
         * Find an entity
         * @method findEntity
         */
        findEntity : function queryform_find_entity() {
            var 
            i,
            queryString,
            attList,
            val,
            oper,
            objoper;

            if (this.source) {
                queryString = "";
                attList     = this.attList;

                for (i = 0; i < attList.length; i++) {
                    val = document.getElementById(this.id + "_" + idName(attList[i])).value;

                    if (val != null && val != "") {
                        if (queryString != "") {
                            queryString += " and ";
                        }

                        oper    = 0;
                        objoper = document.getElementById(this.id + "_oper" + i);

                        if (objoper != null) {
                            oper = parseInt(objoper.value) - 1;
                        }

                        this.otherAttInfo[i].curOper = oper;

                        queryString += this.queryData.buildQueryNode(this.atts[i].name, this.atts[i].type, oper, val);
                    }
                }
                
                this.source.query(queryString);

            }
        },
        
        /*
         * Purge error message
         * @method purgeErrorMessagesOnForm
         */
        purgeErrorMessagesOnForm : function queryform_purge_error_messages_on_form() {
            var
            i,
            divID,
            attList,
            att,
            sourceAtt,
            objDiv,
            messDivName,
            attName;

            divID   = this.id;
            attList = this.attList;

            for (i = 0; i < attList.length; i++) {
                att         = this.atts[i];
                sourceAtt   = this.sourceAtts[i];
                objDiv      = document.getElementById(divID + "_" + idName(attList[i]));

                if (objDiv != null) {
                    if (sourceAtt.readOnly || att.readOnly || (this.checkIdentifying && !att.identifying) || this.allReadOnly){
                        objDiv.disabled = true;
                    } else {
                        objDiv.disabled = false;
                    }
                }

                if (att.kind == "storage" || att.kind == "calculated" || att.kind == "alias") {
                    attName     = idName(sourceAtt.name);
                    messDivName = divID + "_" + attName + "__mess";

                    $('#' + divID + "_" + attName).parent().removeClass('AF_ValueWrong');
                    $('#' + divID + "_" + attName).parent().addClass('AF_ValueOK');
                    $('#' + messDivName).parent().removeClass('AF_messWrong');
                    $('#' + messDivName).removeClass('AF_markedWrong');
                    $('#' + messDivName).html("");
                }
            }
        }
        
    }
);