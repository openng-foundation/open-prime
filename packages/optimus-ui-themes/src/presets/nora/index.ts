import type { Preset } from '@openng/optimus-ui-themes/types';
import type { NoraBaseDesignTokens } from './base/index.d';

import accordion from '@openng/optimus-ui-themes/nora/accordion';
import autocomplete from '@openng/optimus-ui-themes/nora/autocomplete';
import avatar from '@openng/optimus-ui-themes/nora/avatar';
import badge from '@openng/optimus-ui-themes/nora/badge';
import base from '@openng/optimus-ui-themes/nora/base';
import blockui from '@openng/optimus-ui-themes/nora/blockui';
import breadcrumb from '@openng/optimus-ui-themes/nora/breadcrumb';
import button from '@openng/optimus-ui-themes/nora/button';
import card from '@openng/optimus-ui-themes/nora/card';
import carousel from '@openng/optimus-ui-themes/nora/carousel';
import cascadeselect from '@openng/optimus-ui-themes/nora/cascadeselect';
import checkbox from '@openng/optimus-ui-themes/nora/checkbox';
import chip from '@openng/optimus-ui-themes/nora/chip';
import colorpicker from '@openng/optimus-ui-themes/nora/colorpicker';
import confirmdialog from '@openng/optimus-ui-themes/nora/confirmdialog';
import confirmpopup from '@openng/optimus-ui-themes/nora/confirmpopup';
import contextmenu from '@openng/optimus-ui-themes/nora/contextmenu';
import datatable from '@openng/optimus-ui-themes/nora/datatable';
import dataview from '@openng/optimus-ui-themes/nora/dataview';
import datepicker from '@openng/optimus-ui-themes/nora/datepicker';
import dialog from '@openng/optimus-ui-themes/nora/dialog';
import divider from '@openng/optimus-ui-themes/nora/divider';
import dock from '@openng/optimus-ui-themes/nora/dock';
import drawer from '@openng/optimus-ui-themes/nora/drawer';
import editor from '@openng/optimus-ui-themes/nora/editor';
import fieldset from '@openng/optimus-ui-themes/nora/fieldset';
import fileupload from '@openng/optimus-ui-themes/nora/fileupload';
import floatlabel from '@openng/optimus-ui-themes/nora/floatlabel';
import galleria from '@openng/optimus-ui-themes/nora/galleria';
import iconfield from '@openng/optimus-ui-themes/nora/iconfield';
import iftalabel from '@openng/optimus-ui-themes/nora/iftalabel';
import image from '@openng/optimus-ui-themes/nora/image';
import imagecompare from '@openng/optimus-ui-themes/nora/imagecompare';
import inlinemessage from '@openng/optimus-ui-themes/nora/inlinemessage';
import inplace from '@openng/optimus-ui-themes/nora/inplace';
import inputchips from '@openng/optimus-ui-themes/nora/inputchips';
import inputgroup from '@openng/optimus-ui-themes/nora/inputgroup';
import inputnumber from '@openng/optimus-ui-themes/nora/inputnumber';
import inputotp from '@openng/optimus-ui-themes/nora/inputotp';
import inputtext from '@openng/optimus-ui-themes/nora/inputtext';
import knob from '@openng/optimus-ui-themes/nora/knob';
import listbox from '@openng/optimus-ui-themes/nora/listbox';
import megamenu from '@openng/optimus-ui-themes/nora/megamenu';
import menu from '@openng/optimus-ui-themes/nora/menu';
import menubar from '@openng/optimus-ui-themes/nora/menubar';
import message from '@openng/optimus-ui-themes/nora/message';
import metergroup from '@openng/optimus-ui-themes/nora/metergroup';
import multiselect from '@openng/optimus-ui-themes/nora/multiselect';
import orderlist from '@openng/optimus-ui-themes/nora/orderlist';
import organizationchart from '@openng/optimus-ui-themes/nora/organizationchart';
import overlaybadge from '@openng/optimus-ui-themes/nora/overlaybadge';
import paginator from '@openng/optimus-ui-themes/nora/paginator';
import panel from '@openng/optimus-ui-themes/nora/panel';
import panelmenu from '@openng/optimus-ui-themes/nora/panelmenu';
import password from '@openng/optimus-ui-themes/nora/password';
import picklist from '@openng/optimus-ui-themes/nora/picklist';
import popover from '@openng/optimus-ui-themes/nora/popover';
import progressbar from '@openng/optimus-ui-themes/nora/progressbar';
import progressspinner from '@openng/optimus-ui-themes/nora/progressspinner';
import radiobutton from '@openng/optimus-ui-themes/nora/radiobutton';
import rating from '@openng/optimus-ui-themes/nora/rating';
import ripple from '@openng/optimus-ui-themes/nora/ripple';
import scrollpanel from '@openng/optimus-ui-themes/nora/scrollpanel';
import select from '@openng/optimus-ui-themes/nora/select';
import selectbutton from '@openng/optimus-ui-themes/nora/selectbutton';
import skeleton from '@openng/optimus-ui-themes/nora/skeleton';
import slider from '@openng/optimus-ui-themes/nora/slider';
import speeddial from '@openng/optimus-ui-themes/nora/speeddial';
import splitbutton from '@openng/optimus-ui-themes/nora/splitbutton';
import splitter from '@openng/optimus-ui-themes/nora/splitter';
import stepper from '@openng/optimus-ui-themes/nora/stepper';
import steps from '@openng/optimus-ui-themes/nora/steps';
import tabmenu from '@openng/optimus-ui-themes/nora/tabmenu';
import tabs from '@openng/optimus-ui-themes/nora/tabs';
import tabview from '@openng/optimus-ui-themes/nora/tabview';
import tag from '@openng/optimus-ui-themes/nora/tag';
import terminal from '@openng/optimus-ui-themes/nora/terminal';
import textarea from '@openng/optimus-ui-themes/nora/textarea';
import texteditor from '@openng/optimus-ui-themes/nora/texteditor';
import tieredmenu from '@openng/optimus-ui-themes/nora/tieredmenu';
import timeline from '@openng/optimus-ui-themes/nora/timeline';
import toast from '@openng/optimus-ui-themes/nora/toast';
import togglebutton from '@openng/optimus-ui-themes/nora/togglebutton';
import toggleswitch from '@openng/optimus-ui-themes/nora/toggleswitch';
import toolbar from '@openng/optimus-ui-themes/nora/toolbar';
import tooltip from '@openng/optimus-ui-themes/nora/tooltip';
import tree from '@openng/optimus-ui-themes/nora/tree';
import treeselect from '@openng/optimus-ui-themes/nora/treeselect';
import treetable from '@openng/optimus-ui-themes/nora/treetable';
import virtualscroller from '@openng/optimus-ui-themes/nora/virtualscroller';

export default {
    ...base,
    components: {
        accordion,
        autocomplete,
        avatar,
        badge,
        blockui,
        breadcrumb,
        button,
        datepicker,
        card,
        carousel,
        cascadeselect,
        checkbox,
        chip,
        colorpicker,
        confirmdialog,
        confirmpopup,
        contextmenu,
        dataview,
        datatable,
        dialog,
        divider,
        dock,
        drawer,
        editor,
        fieldset,
        fileupload,
        iftalabel,
        floatlabel,
        galleria,
        iconfield,
        image,
        imagecompare,
        inlinemessage,
        inplace,
        inputchips,
        inputgroup,
        inputnumber,
        inputotp,
        inputtext,
        knob,
        listbox,
        megamenu,
        menu,
        menubar,
        message,
        metergroup,
        multiselect,
        orderlist,
        organizationchart,
        overlaybadge,
        popover,
        paginator,
        password,
        panel,
        panelmenu,
        picklist,
        progressbar,
        progressspinner,
        radiobutton,
        rating,
        ripple,
        scrollpanel,
        select,
        selectbutton,
        skeleton,
        slider,
        speeddial,
        splitter,
        splitbutton,
        stepper,
        steps,
        tabmenu,
        tabs,
        tabview,
        textarea,
        texteditor,
        tieredmenu,
        tag,
        terminal,
        timeline,
        togglebutton,
        toggleswitch,
        tree,
        treeselect,
        treetable,
        toast,
        toolbar,
        tooltip,
        virtualscroller
    }
} satisfies Preset<NoraBaseDesignTokens>;
