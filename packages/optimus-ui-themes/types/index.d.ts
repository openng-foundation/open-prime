/**
 *
 * @module themes
 *
 */
import type { StyleOptions, ThemeOptions } from '@openng/optimus-ui-styled';

import type { AccordionDesignTokens } from './accordion';
import type { AutoCompleteDesignTokens } from './autocomplete';
import type { AvatarDesignTokens } from './avatar';
import type { BadgeDesignTokens } from './badge';
import type { BlockUIDesignTokens } from './blockui';
import type { BreadcrumbDesignTokens } from './breadcrumb';
import type { ButtonDesignTokens } from './button';
import type { CardDesignTokens } from './card';
import type { CarouselDesignTokens } from './carousel';
import type { CascadeSelectDesignTokens } from './cascadeselect';
import type { CheckboxDesignTokens } from './checkbox';
import type { ChipDesignTokens } from './chip';
import type { ColorPickerDesignTokens } from './colorpicker';
import type { ConfirmDialogDesignTokens } from './confirmdialog';
import type { ConfirmPopupDesignTokens } from './confirmpopup';
import type { ContextMenuDesignTokens } from './contextmenu';
import type { DataTableDesignTokens } from './datatable';
import type { DataViewDesignTokens } from './dataview';
import type { DatePickerDesignTokens } from './datepicker';
import type { DialogDesignTokens } from './dialog';
import type { DividerDesignTokens } from './divider';
import type { DockDesignTokens } from './dock';
import type { DrawerDesignTokens } from './drawer';
import type { EditorDesignTokens } from './editor';
import type { FieldsetDesignTokens } from './fieldset';
import type { FileUploadDesignTokens } from './fileupload';
import type { FloatLabelDesignTokens } from './floatlabel';
import type { GalleriaDesignTokens } from './galleria';
import type { IconFieldDesignTokens } from './iconfield';
import type { IftaLabelDesignTokens } from './iftalabel';
import type { ImageDesignTokens } from './image';
import type { ImageCompareDesignTokens } from './imagecompare';
import type { InlineMessageDesignTokens } from './inlinemessage';
import type { InplaceDesignTokens } from './inplace';
import type { InputChipsDesignTokens } from './inputchips';
import type { InputGroupDesignTokens } from './inputgroup';
import type { InputNumberDesignTokens } from './inputnumber';
import type { InputOtpDesignTokens } from './inputotp';
import type { InputTextDesignTokens } from './inputtext';
import type { KnobDesignTokens } from './knob';
import type { ListboxDesignTokens } from './listbox';
import type { MegaMenuDesignTokens } from './megamenu';
import type { MenuDesignTokens } from './menu';
import type { MenubarDesignTokens } from './menubar';
import type { MessageDesignTokens } from './message';
import type { MeterGroupDesignTokens } from './metergroup';
import type { MultiSelectDesignTokens } from './multiselect';
import type { OrderListDesignTokens } from './orderlist';
import type { OrganizationChartDesignTokens } from './organizationchart';
import type { OverlayBadgeDesignTokens } from './overlaybadge';
import type { PaginatorDesignTokens } from './paginator';
import type { PanelDesignTokens } from './panel';
import type { PanelMenuDesignTokens } from './panelmenu';
import type { PasswordDesignTokens } from './password';
import type { PickListDesignTokens } from './picklist';
import type { PopoverDesignTokens } from './popover';
import type { ProgressBarDesignTokens } from './progressbar';
import type { ProgressSpinnerDesignTokens } from './progressspinner';
import type { RadioButtonDesignTokens } from './radiobutton';
import type { RatingDesignTokens } from './rating';
import type { RippleDesignTokens } from './ripple';
import type { ScrollPanelDesignTokens } from './scrollpanel';
import type { SelectDesignTokens } from './select';
import type { SelectButtonDesignTokens } from './selectbutton';
import type { SkeletonDesignTokens } from './skeleton';
import type { SliderDesignTokens } from './slider';
import type { SpeedDialDesignTokens } from './speeddial';
import type { SplitButtonDesignTokens } from './splitbutton';
import type { SplitterDesignTokens } from './splitter';
import type { StepperDesignTokens } from './stepper';
import type { StepsDesignTokens } from './steps';
import type { TabmenuDesignTokens } from './tabmenu';
import type { TabsDesignTokens } from './tabs';
import type { TabViewDesignTokens } from './tabview';
import type { TagDesignTokens } from './tag';
import type { TerminalDesignTokens } from './terminal';
import type { TextareaDesignTokens } from './textarea';
import type { TextEditorDesignTokens } from './texteditor';
import type { TieredMenuDesignTokens } from './tieredmenu';
import type { TimelineDesignTokens } from './timeline';
import type { ToastDesignTokens } from './toast';
import type { ToggleButtonDesignTokens } from './togglebutton';
import type { ToggleSwitchDesignTokens } from './toggleswitch';
import type { ToolbarDesignTokens } from './toolbar';
import type { TooltipDesignTokens } from './tooltip';
import type { TreeDesignTokens } from './tree';
import type { TreeSelectDesignTokens } from './treeselect';
import type { TreeTableDesignTokens } from './treetable';
import type { VirtualScrollerDesignTokens } from './virtualscroller';

export interface ColorScheme<T> {
    light?: Omit<T, 'colorScheme' | 'extend' | 'css'>;
    dark?: Omit<T, 'colorScheme' | 'extend' | 'css'>;
}

export interface ColorSchemeDesignToken<T> {
    colorScheme?: ColorScheme<T>;
}

export declare type ExtendedCSS = string | ((options: StyleOptions) => string) | undefined;
export declare type ExtendedTokens = Record<string, object | string | number>;

export interface DesignTokens<T> extends ColorSchemeDesignToken<T> {
    css?: ExtendedCSS;
    extend?: ExtendedTokens;
}

export declare type RequiredDesignTokens<T, C = never> = {
    [K in keyof Omit<T, keyof DesignTokens<T>>]-?: DeepRequired<T[K]>;
} & DesignTokens<T> &
    (C extends never ? object : ColorSchemeDesignToken<C>);

// @todo: Remove this when the types are fixed in the styled package. Use `ColorScale` from `@openng/optimus-ui-styled` instead.
export interface PaletteDesignToken {
    0?: string;
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
    950?: string;
}

export interface ComponentsDesignTokens {
    accordion?: AccordionDesignTokens;
    autocomplete?: AutoCompleteDesignTokens;
    avatar?: AvatarDesignTokens;
    badge?: BadgeDesignTokens;
    blockui?: BlockUIDesignTokens;
    breadcrumb?: BreadcrumbDesignTokens;
    button?: ButtonDesignTokens;
    card?: CardDesignTokens;
    carousel?: CarouselDesignTokens;
    cascadeselect?: CascadeSelectDesignTokens;
    checkbox?: CheckboxDesignTokens;
    chip?: ChipDesignTokens;
    colorpicker?: ColorPickerDesignTokens;
    confirmdialog?: ConfirmDialogDesignTokens;
    confirmpopup?: ConfirmPopupDesignTokens;
    contextmenu?: ContextMenuDesignTokens;
    datatable?: DataTableDesignTokens;
    dataview?: DataViewDesignTokens;
    datepicker?: DatePickerDesignTokens;
    dialog?: DialogDesignTokens;
    divider?: DividerDesignTokens;
    dock?: DockDesignTokens;
    drawer?: DrawerDesignTokens;
    editor?: EditorDesignTokens;
    fieldset?: FieldsetDesignTokens;
    fileupload?: FileUploadDesignTokens;
    floatlabel?: FloatLabelDesignTokens;
    galleria?: GalleriaDesignTokens;
    iconfield?: IconFieldDesignTokens;
    iftalabel?: IftaLabelDesignTokens;
    image?: ImageDesignTokens;
    imagecompare?: ImageCompareDesignTokens;
    inlinemessage?: InlineMessageDesignTokens;
    inplace?: InplaceDesignTokens;
    inputchips?: InputChipsDesignTokens;
    inputgroup?: InputGroupDesignTokens;
    inputnumber?: InputNumberDesignTokens;
    inputotp?: InputOtpDesignTokens;
    inputtext?: InputTextDesignTokens;
    knob?: KnobDesignTokens;
    listbox?: ListboxDesignTokens;
    megamenu?: MegaMenuDesignTokens;
    menu?: MenuDesignTokens;
    menubar?: MenubarDesignTokens;
    message?: MessageDesignTokens;
    metergroup?: MeterGroupDesignTokens;
    multiselect?: MultiSelectDesignTokens;
    orderlist?: OrderListDesignTokens;
    organizationchart?: OrganizationChartDesignTokens;
    overlaybadge?: OverlayBadgeDesignTokens;
    paginator?: PaginatorDesignTokens;
    panel?: PanelDesignTokens;
    panelmenu?: PanelMenuDesignTokens;
    password?: PasswordDesignTokens;
    picklist?: PickListDesignTokens;
    popover?: PopoverDesignTokens;
    progressbar?: ProgressBarDesignTokens;
    progressspinner?: ProgressSpinnerDesignTokens;
    radiobutton?: RadioButtonDesignTokens;
    rating?: RatingDesignTokens;
    ripple?: RippleDesignTokens;
    scrollpanel?: ScrollPanelDesignTokens;
    select?: SelectDesignTokens;
    selectbutton?: SelectButtonDesignTokens;
    skeleton?: SkeletonDesignTokens;
    slider?: SliderDesignTokens;
    speeddial?: SpeedDialDesignTokens;
    splitbutton?: SplitButtonDesignTokens;
    splitter?: SplitterDesignTokens;
    stepper?: StepperDesignTokens;
    steps?: StepsDesignTokens;
    tabmenu?: TabmenuDesignTokens;
    tabs?: TabsDesignTokens;
    tabview?: TabViewDesignTokens;
    tag?: TagDesignTokens;
    terminal?: TerminalDesignTokens;
    textarea?: TextareaDesignTokens;
    texteditor?: TextEditorDesignTokens;
    tieredmenu?: TieredMenuDesignTokens;
    timeline?: TimelineDesignTokens;
    toast?: ToastDesignTokens;
    togglebutton?: ToggleButtonDesignTokens;
    toggleswitch?: ToggleSwitchDesignTokens;
    toolbar?: ToolbarDesignTokens;
    tooltip?: TooltipDesignTokens;
    tree?: TreeDesignTokens;
    treeselect?: TreeSelectDesignTokens;
    treetable?: TreeTableDesignTokens;
    virtualscroller?: VirtualScrollerDesignTokens;
    [key: PropertyKey]: object | string | number | undefined;
}

export declare type BaseDesignTokens<T extends Partial<{ primitive: unknown; semantic: unknown }> = object> = {
    primitive?: T extends { primitive?: infer P } ? P : undefined;
    semantic?: T extends { semantic?: infer S } ? S : undefined;
};

export declare type Preset<T extends Partial<{ primitive: unknown; semantic: unknown }> = object> = BaseDesignTokens<T> & {
    components?: ComponentsDesignTokens;
    extend?: ExtendedTokens;
    css?: ExtendedCSS;
    [key: PropertyKey]: object | string | number | undefined;
};

export declare type Theme = { preset?: Preset; options?: ThemeOptions };

/**
 * Custom types
 */
export declare type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
