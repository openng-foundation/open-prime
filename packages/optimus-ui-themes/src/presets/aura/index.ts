import type { Preset } from '@openng/optimus-ui-themes/types';
import type { AuraBaseDesignTokens } from './base/index.d';

import accordion from '@openng/optimus-ui-themes/aura/accordion';
import autocomplete from '@openng/optimus-ui-themes/aura/autocomplete';
import avatar from '@openng/optimus-ui-themes/aura/avatar';
import badge from '@openng/optimus-ui-themes/aura/badge';
import base from '@openng/optimus-ui-themes/aura/base';
import blockui from '@openng/optimus-ui-themes/aura/blockui';
import breadcrumb from '@openng/optimus-ui-themes/aura/breadcrumb';
import button from '@openng/optimus-ui-themes/aura/button';
import card from '@openng/optimus-ui-themes/aura/card';
import carousel from '@openng/optimus-ui-themes/aura/carousel';
import cascadeselect from '@openng/optimus-ui-themes/aura/cascadeselect';
import charts from '@openng/optimus-ui-themes/aura/charts';
import checkbox from '@openng/optimus-ui-themes/aura/checkbox';
import chip from '@openng/optimus-ui-themes/aura/chip';
import colorpicker from '@openng/optimus-ui-themes/aura/colorpicker';
import confirmdialog from '@openng/optimus-ui-themes/aura/confirmdialog';
import confirmpopup from '@openng/optimus-ui-themes/aura/confirmpopup';
import contextmenu from '@openng/optimus-ui-themes/aura/contextmenu';
import css from '@openng/optimus-ui-themes/aura/css';
import datatable from '@openng/optimus-ui-themes/aura/datatable';
import dataview from '@openng/optimus-ui-themes/aura/dataview';
import datepicker from '@openng/optimus-ui-themes/aura/datepicker';
import dialog from '@openng/optimus-ui-themes/aura/dialog';
import divider from '@openng/optimus-ui-themes/aura/divider';
import dock from '@openng/optimus-ui-themes/aura/dock';
import drawer from '@openng/optimus-ui-themes/aura/drawer';
import editor from '@openng/optimus-ui-themes/aura/editor';
import fieldset from '@openng/optimus-ui-themes/aura/fieldset';
import fileupload from '@openng/optimus-ui-themes/aura/fileupload';
import floatlabel from '@openng/optimus-ui-themes/aura/floatlabel';
import galleria from '@openng/optimus-ui-themes/aura/galleria';
import iconfield from '@openng/optimus-ui-themes/aura/iconfield';
import iftalabel from '@openng/optimus-ui-themes/aura/iftalabel';
import image from '@openng/optimus-ui-themes/aura/image';
import imagecompare from '@openng/optimus-ui-themes/aura/imagecompare';
import inlinemessage from '@openng/optimus-ui-themes/aura/inlinemessage';
import inplace from '@openng/optimus-ui-themes/aura/inplace';
import inputchips from '@openng/optimus-ui-themes/aura/inputchips';
import inputgroup from '@openng/optimus-ui-themes/aura/inputgroup';
import inputnumber from '@openng/optimus-ui-themes/aura/inputnumber';
import inputotp from '@openng/optimus-ui-themes/aura/inputotp';
import inputtext from '@openng/optimus-ui-themes/aura/inputtext';
import knob from '@openng/optimus-ui-themes/aura/knob';
import listbox from '@openng/optimus-ui-themes/aura/listbox';
import megamenu from '@openng/optimus-ui-themes/aura/megamenu';
import menu from '@openng/optimus-ui-themes/aura/menu';
import menubar from '@openng/optimus-ui-themes/aura/menubar';
import message from '@openng/optimus-ui-themes/aura/message';
import metergroup from '@openng/optimus-ui-themes/aura/metergroup';
import multiselect from '@openng/optimus-ui-themes/aura/multiselect';
import orderlist from '@openng/optimus-ui-themes/aura/orderlist';
import organizationchart from '@openng/optimus-ui-themes/aura/organizationchart';
import overlaybadge from '@openng/optimus-ui-themes/aura/overlaybadge';
import paginator from '@openng/optimus-ui-themes/aura/paginator';
import panel from '@openng/optimus-ui-themes/aura/panel';
import panelmenu from '@openng/optimus-ui-themes/aura/panelmenu';
import password from '@openng/optimus-ui-themes/aura/password';
import picklist from '@openng/optimus-ui-themes/aura/picklist';
import popover from '@openng/optimus-ui-themes/aura/popover';
import progressbar from '@openng/optimus-ui-themes/aura/progressbar';
import progressspinner from '@openng/optimus-ui-themes/aura/progressspinner';
import radiobutton from '@openng/optimus-ui-themes/aura/radiobutton';
import rating from '@openng/optimus-ui-themes/aura/rating';
import ripple from '@openng/optimus-ui-themes/aura/ripple';
import scrollpanel from '@openng/optimus-ui-themes/aura/scrollpanel';
import select from '@openng/optimus-ui-themes/aura/select';
import selectbutton from '@openng/optimus-ui-themes/aura/selectbutton';
import skeleton from '@openng/optimus-ui-themes/aura/skeleton';
import slider from '@openng/optimus-ui-themes/aura/slider';
import speeddial from '@openng/optimus-ui-themes/aura/speeddial';
import splitbutton from '@openng/optimus-ui-themes/aura/splitbutton';
import splitter from '@openng/optimus-ui-themes/aura/splitter';
import stepper from '@openng/optimus-ui-themes/aura/stepper';
import steps from '@openng/optimus-ui-themes/aura/steps';
import tabmenu from '@openng/optimus-ui-themes/aura/tabmenu';
import tabs from '@openng/optimus-ui-themes/aura/tabs';
import tabview from '@openng/optimus-ui-themes/aura/tabview';
import tag from '@openng/optimus-ui-themes/aura/tag';
import terminal from '@openng/optimus-ui-themes/aura/terminal';
import textarea from '@openng/optimus-ui-themes/aura/textarea';
import tieredmenu from '@openng/optimus-ui-themes/aura/tieredmenu';
import timeline from '@openng/optimus-ui-themes/aura/timeline';
import toast from '@openng/optimus-ui-themes/aura/toast';
import togglebutton from '@openng/optimus-ui-themes/aura/togglebutton';
import toggleswitch from '@openng/optimus-ui-themes/aura/toggleswitch';
import toolbar from '@openng/optimus-ui-themes/aura/toolbar';
import tooltip from '@openng/optimus-ui-themes/aura/tooltip';
import tree from '@openng/optimus-ui-themes/aura/tree';
import treeselect from '@openng/optimus-ui-themes/aura/treeselect';
import treetable from '@openng/optimus-ui-themes/aura/treetable';
import virtualscroller from '@openng/optimus-ui-themes/aura/virtualscroller';

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
        card,
        carousel,
        cascadeselect,
        charts,
        checkbox,
        chip,
        colorpicker,
        confirmdialog,
        confirmpopup,
        contextmenu,
        datatable,
        dataview,
        datepicker,
        dialog,
        divider,
        dock,
        drawer,
        editor,
        fieldset,
        fileupload,
        floatlabel,
        galleria,
        iconfield,
        iftalabel,
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
        paginator,
        panel,
        panelmenu,
        password,
        picklist,
        popover,
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
        splitbutton,
        splitter,
        stepper,
        steps,
        tabmenu,
        tabs,
        tabview,
        tag,
        terminal,
        textarea,
        tieredmenu,
        timeline,
        toast,
        togglebutton,
        toggleswitch,
        toolbar,
        tooltip,
        tree,
        treeselect,
        treetable,
        virtualscroller
    },
    css
} satisfies Preset<AuraBaseDesignTokens>;
