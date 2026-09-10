import type { Preset } from '@openng/optimus-ui-themes/types';
import type { LaraBaseDesignTokens } from './base/index.d';

import accordion from '@openng/optimus-ui-themes/lara/accordion';
import autocomplete from '@openng/optimus-ui-themes/lara/autocomplete';
import avatar from '@openng/optimus-ui-themes/lara/avatar';
import badge from '@openng/optimus-ui-themes/lara/badge';
import base from '@openng/optimus-ui-themes/lara/base';
import blockui from '@openng/optimus-ui-themes/lara/blockui';
import breadcrumb from '@openng/optimus-ui-themes/lara/breadcrumb';
import button from '@openng/optimus-ui-themes/lara/button';
import card from '@openng/optimus-ui-themes/lara/card';
import carousel from '@openng/optimus-ui-themes/lara/carousel';
import cascadeselect from '@openng/optimus-ui-themes/lara/cascadeselect';
import checkbox from '@openng/optimus-ui-themes/lara/checkbox';
import chip from '@openng/optimus-ui-themes/lara/chip';
import colorpicker from '@openng/optimus-ui-themes/lara/colorpicker';
import confirmdialog from '@openng/optimus-ui-themes/lara/confirmdialog';
import confirmpopup from '@openng/optimus-ui-themes/lara/confirmpopup';
import contextmenu from '@openng/optimus-ui-themes/lara/contextmenu';
import datatable from '@openng/optimus-ui-themes/lara/datatable';
import dataview from '@openng/optimus-ui-themes/lara/dataview';
import datepicker from '@openng/optimus-ui-themes/lara/datepicker';
import dialog from '@openng/optimus-ui-themes/lara/dialog';
import divider from '@openng/optimus-ui-themes/lara/divider';
import dock from '@openng/optimus-ui-themes/lara/dock';
import drawer from '@openng/optimus-ui-themes/lara/drawer';
import editor from '@openng/optimus-ui-themes/lara/editor';
import fieldset from '@openng/optimus-ui-themes/lara/fieldset';
import fileupload from '@openng/optimus-ui-themes/lara/fileupload';
import floatlabel from '@openng/optimus-ui-themes/lara/floatlabel';
import galleria from '@openng/optimus-ui-themes/lara/galleria';
import iconfield from '@openng/optimus-ui-themes/lara/iconfield';
import iftalabel from '@openng/optimus-ui-themes/lara/iftalabel';
import image from '@openng/optimus-ui-themes/lara/image';
import imagecompare from '@openng/optimus-ui-themes/lara/imagecompare';
import inlinemessage from '@openng/optimus-ui-themes/lara/inlinemessage';
import inplace from '@openng/optimus-ui-themes/lara/inplace';
import inputchips from '@openng/optimus-ui-themes/lara/inputchips';
import inputgroup from '@openng/optimus-ui-themes/lara/inputgroup';
import inputnumber from '@openng/optimus-ui-themes/lara/inputnumber';
import inputotp from '@openng/optimus-ui-themes/lara/inputotp';
import inputtext from '@openng/optimus-ui-themes/lara/inputtext';
import knob from '@openng/optimus-ui-themes/lara/knob';
import listbox from '@openng/optimus-ui-themes/lara/listbox';
import megamenu from '@openng/optimus-ui-themes/lara/megamenu';
import menu from '@openng/optimus-ui-themes/lara/menu';
import menubar from '@openng/optimus-ui-themes/lara/menubar';
import message from '@openng/optimus-ui-themes/lara/message';
import metergroup from '@openng/optimus-ui-themes/lara/metergroup';
import multiselect from '@openng/optimus-ui-themes/lara/multiselect';
import orderlist from '@openng/optimus-ui-themes/lara/orderlist';
import organizationchart from '@openng/optimus-ui-themes/lara/organizationchart';
import overlaybadge from '@openng/optimus-ui-themes/lara/overlaybadge';
import paginator from '@openng/optimus-ui-themes/lara/paginator';
import panel from '@openng/optimus-ui-themes/lara/panel';
import panelmenu from '@openng/optimus-ui-themes/lara/panelmenu';
import password from '@openng/optimus-ui-themes/lara/password';
import picklist from '@openng/optimus-ui-themes/lara/picklist';
import popover from '@openng/optimus-ui-themes/lara/popover';
import progressbar from '@openng/optimus-ui-themes/lara/progressbar';
import progressspinner from '@openng/optimus-ui-themes/lara/progressspinner';
import radiobutton from '@openng/optimus-ui-themes/lara/radiobutton';
import rating from '@openng/optimus-ui-themes/lara/rating';
import ripple from '@openng/optimus-ui-themes/lara/ripple';
import scrollpanel from '@openng/optimus-ui-themes/lara/scrollpanel';
import select from '@openng/optimus-ui-themes/lara/select';
import selectbutton from '@openng/optimus-ui-themes/lara/selectbutton';
import skeleton from '@openng/optimus-ui-themes/lara/skeleton';
import slider from '@openng/optimus-ui-themes/lara/slider';
import speeddial from '@openng/optimus-ui-themes/lara/speeddial';
import splitbutton from '@openng/optimus-ui-themes/lara/splitbutton';
import splitter from '@openng/optimus-ui-themes/lara/splitter';
import stepper from '@openng/optimus-ui-themes/lara/stepper';
import steps from '@openng/optimus-ui-themes/lara/steps';
import tabmenu from '@openng/optimus-ui-themes/lara/tabmenu';
import tabs from '@openng/optimus-ui-themes/lara/tabs';
import tabview from '@openng/optimus-ui-themes/lara/tabview';
import tag from '@openng/optimus-ui-themes/lara/tag';
import terminal from '@openng/optimus-ui-themes/lara/terminal';
import textarea from '@openng/optimus-ui-themes/lara/textarea';
import tieredmenu from '@openng/optimus-ui-themes/lara/tieredmenu';
import scheduler from '@openng/optimus-ui-themes/lara/scheduler';
import timeline from '@openng/optimus-ui-themes/lara/timeline';
import toast from '@openng/optimus-ui-themes/lara/toast';
import togglebutton from '@openng/optimus-ui-themes/lara/togglebutton';
import toggleswitch from '@openng/optimus-ui-themes/lara/toggleswitch';
import toolbar from '@openng/optimus-ui-themes/lara/toolbar';
import tooltip from '@openng/optimus-ui-themes/lara/tooltip';
import tree from '@openng/optimus-ui-themes/lara/tree';
import treeselect from '@openng/optimus-ui-themes/lara/treeselect';
import treetable from '@openng/optimus-ui-themes/lara/treetable';
import virtualscroller from '@openng/optimus-ui-themes/lara/virtualscroller';

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
        tieredmenu,
        tag,
        terminal,
        scheduler,
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
} satisfies Preset<LaraBaseDesignTokens>;
