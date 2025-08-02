export interface AttributeDataType {
  dataTypeId: number;
  dataTypeName: string;
  isActive: boolean;
}

export enum DataTypeName {
  String = 'String',
  Integer = 'Integer',
  Decimal = 'Decimal',
  Boolean = 'Boolean',
  Date = 'Date',
  JSON = 'JSON'
}
export interface CreateAttributeDataTypeDto {
  dataTypeName: string;
}
