export type ReactElement = {
  $$typeof: any;
  type: any;
  key: any;
  ref: any;
  props: any;
  _owner: any;
};
export type ReactText = string | number;

export type ReactFragment = ReactEmpty | Iterable<ReactNode>;

export type ReactNode = ReactElement | ReactFragment | ReactText;

export type ReactEmpty = null | void | boolean;

export type ReactNodeList = ReactEmpty | ReactNode;
