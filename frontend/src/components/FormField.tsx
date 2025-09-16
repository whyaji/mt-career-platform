import { Group, NumberInput, Radio, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { type ComponentProps, type FC, useState } from 'react';

export function TextInputField({ ...props }: ComponentProps<typeof TextInput>) {
  return <TextInput {...props} />;
}

export function NumberInputField({ ...props }: ComponentProps<typeof NumberInput>) {
  return <NumberInput {...props} />;
}

export function TextAreaField({ ...props }: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}

export function SelectField({ ...props }: ComponentProps<typeof Select>) {
  return <Select {...props} />;
}

export function DateInputField({ ...props }: ComponentProps<typeof DatePickerInput>) {
  return (
    <DatePickerInput
      {...props}
      valueFormat="DD MMMM YYYY"
      locale="id"
      value={props.value === '' ? null : props.value}
    />
  );
}

export function RadioGroupField({
  ...props
}: Omit<ComponentProps<typeof Radio.Group>, 'children'> & {
  data: { value: string; label: string }[];
  withOther?: boolean;
}) {
  const { data, withOther, value, onChange, ...rest } = props;
  const [buildInValue, setBuildInValue] = useState('');
  const [isSelectOther, setIsSelectOther] = useState(false);

  const handleChange = (selectedValue: string) => {
    // Clear other value when selecting predefined options
    setBuildInValue(selectedValue);
    if (selectedValue === 'other') {
      setIsSelectOther(true);
      onChange?.('');
    } else {
      setIsSelectOther(false);
      onChange?.(selectedValue);
    }
  };

  return (
    <div key={props.key}>
      <Radio.Group {...rest} value={buildInValue} onChange={handleChange}>
        <Stack gap="lg" my="lg">
          {data.map((item) => (
            <Radio value={item.value} label={item.label} key={item.value} color="#F03800" />
          ))}

          {withOther && (
            <Group gap="xs">
              <Radio value="other" label="" color="#F03800" />

              <TextInput
                flex={1}
                placeholder="Masukkan lainnya..."
                value={isSelectOther ? (value ?? '') : ''}
                onChange={
                  isSelectOther ? (event) => onChange?.(event.currentTarget.value) : undefined
                }
                styles={{
                  input: {
                    fontSize: '14px',
                  },
                }}
                onClick={
                  !isSelectOther
                    ? () => {
                        handleChange('other');
                      }
                    : undefined
                }
              />
            </Group>
          )}
        </Stack>
      </Radio.Group>
    </div>
  );
}

export type FormFieldProps = {
  key: string;
  number?: number;
  textInputProps?: ComponentProps<typeof TextInputField>;
  numberInputProps?: ComponentProps<typeof NumberInputField>;
  textAreaProps?: ComponentProps<typeof TextAreaField>;
  selectProps?: ComponentProps<typeof SelectField>;
  dateInputProps?: ComponentProps<typeof DateInputField>;
  radioGroupProps?: ComponentProps<typeof RadioGroupField>;
};

export const FormField: FC<FormFieldProps> = ({
  key,
  number,
  textInputProps,
  numberInputProps,
  textAreaProps,
  selectProps,
  dateInputProps,
  radioGroupProps,
}) => {
  if (textInputProps) {
    return (
      <TextInputField
        key={key}
        {...textInputProps}
        label={number ? `${number}. ${textInputProps.label}` : textInputProps.label}
      />
    );
  }
  if (numberInputProps) {
    return (
      <NumberInputField
        key={key}
        {...numberInputProps}
        label={number ? `${number}. ${numberInputProps.label}` : numberInputProps.label}
      />
    );
  }
  if (textAreaProps) {
    return (
      <TextAreaField
        key={key}
        {...textAreaProps}
        label={number ? `${number}. ${textAreaProps.label}` : textAreaProps.label}
      />
    );
  }
  if (selectProps) {
    return (
      <SelectField
        key={key}
        {...selectProps}
        label={number ? `${number}. ${selectProps.label}` : selectProps.label}
      />
    );
  }
  if (dateInputProps) {
    return (
      <DateInputField
        key={key}
        {...dateInputProps}
        label={number ? `${number}. ${dateInputProps.label}` : dateInputProps.label}
      />
    );
  }
  if (radioGroupProps) {
    return (
      <RadioGroupField
        key={key}
        {...radioGroupProps}
        label={number ? `${number}. ${radioGroupProps.label}` : radioGroupProps.label}
      />
    );
  }
};
