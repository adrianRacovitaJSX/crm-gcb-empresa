import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useSelector, useDispatch } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { erp } from '@/redux/erp/actions';
import { useNavigate } from 'react-router-dom';
import { settingsAction } from '@/redux/settings/actions';
import useFetch from '@/hooks/useFetch';

export default function CrearAlbaran({ subTotal: initialSubTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_quote_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [recargoTotal, setRecargoTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_quote_number + 1);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(initialSubTotal);

  const fetchProducts = async () => {
    const response = await fetch('http://localhost:8888/api/product/list', {
      credentials: 'include', // Include cookies in the request
    });
    const data = await response.json();
    console.log(data);
    return data;
  };
  const { result: products, isLoading, isSuccess, error } = useFetch(fetchProducts);

  const entity = 'quote';

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add this line to get the navigate function

  const handelTaxChange = (value) => {
    setTaxRate(value / 1);
  };

  const recargoChange = (value) => {
    setRecargo(value / 1);
  };

  useEffect(() => {
    const taxValue = calculate.multiply(subTotal, taxRate) / 100;
    const recargoValue = calculate.multiply(subTotal, recargo) / 100;
    const currentTotal = calculate.add(subTotal, taxValue);

    setTaxTotal(taxValue);
    setRecargoTotal(recargoValue);

    const total = calculate.add(currentTotal, recargoValue) / 1;
    setTotal(total);
  }, [subTotal, taxRate, recargo]);

  const onItemNameChange = (index, value) => {
    if (products) {
      const item = products.find((item) => item.name === value);
      if (item) {
        const fields = form.getFieldsValue();
        fields.items[index].description = item.description;
        fields.items[index].price = item.price;
        form.setFieldsValue(fields);
        updateItemTotal(index);
      }
    }
  };
  const updateItemTotal = (index) => {
    const fields = form.getFieldsValue();
    const item = fields.items[index];
    const itemTotal = calculate.multiply(item.quantity, item.price);
    fields.items[index].total = itemTotal;
    form.setFieldsValue(fields);
    updateSubTotal();
  };

  const updateSubTotal = () => {
    const fields = form.getFieldsValue();
    const newSubTotal = fields.items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    setSubTotal(newSubTotal);
  };

  const onQuantityOrPriceChange = (index) => {
    updateItemTotal(index);
  };

  const onSubmit = (fieldsValue) => {
    dispatch(erp.create({ entity, jsonData: fieldsValue }));
    navigate('/quote'); // Add this line to redirect after submitting
  };

  return (
    <div>
      <div className="bg-white p-10 rounded-2xl">
        <h2 className="font-bold text-2xl pb-6">Crear albarán</h2>
        <Form form={form} initialValues={{ items: [{}] }} onFinish={onSubmit}>
          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={9}>
              <Form.Item
                name="client"
                label={translate('Client')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <AutoCompleteAsync
                  entity={'client'}
                  displayLabels={['name']}
                  searchFields={'name'}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('number')}
                name="number"
                initialValue={lastNumber}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('year')}
                name="year"
                initialValue={currentYear}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('status')}
                name="status"
                rules={[
                  {
                    required: false,
                  },
                ]}
                initialValue={'draft'}
              >
                <Select
                  options={[
                    { value: 'draft', label: translate('Draft') },
                    { value: 'pending', label: translate('Pending') },
                    { value: 'sent', label: translate('Sent') },
                  ]}
                ></Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={9}>
              <Form.Item label={translate('Note')} name="note">
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item
                name="date"
                label={translate('Date')}
                rules={[
                  {
                    required: true,
                    type: 'object',
                  },
                ]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={7}>
              <Form.Item
                name="expiredDate"
                label="Vencimiento"
                rules={[
                  {
                    required: true,
                    type: 'object',
                  },
                ]}
                initialValue={dayjs().add(30, 'days')}
              >
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
          </Row>
          <Row className="mb-4 relative mt-4" gutter={[12, 12]}>
            <Col className="gutter-row" span={4}>
              Código
            </Col>
            <Col className="gutter-row" span={5}>
              Desc.
            </Col>
            <Col className="gutter-row" span={3}>
              Cantidad
            </Col>
            <Col className="gutter-row" span={6}>
              Precio
            </Col>
            <Col className="gutter-row" span={6}>
              Total
            </Col>
          </Row>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey }) => (
                  <Row key={key} gutter={[12, 12]} className="w-full">
                    <Col span={4} className="w-full">
                      <Form.Item
                        name={[name, 'itemName']}
                        fieldKey={[fieldKey, 'itemName']}
                        rules={[{ required: true, message: 'Elige código' }]}
                      >
                        <Select
                          placeholder="Código"
                          onChange={(value) => onItemNameChange(name, value)}
                          showSearch
                          optionFilterProp="children"
                        >
                          {products &&
                            products.map((item) => (
                              <Select.Option key={item.name} value={item.name}>
                                {item.name}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={5} className="w-full">
                      <Form.Item
                        name={[name, 'description']}
                        fieldKey={[fieldKey, 'description']}
                        rules={[{ required: true, message: 'Introduce descripción' }]}
                      >
                        <Input placeholder="Descripción" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        name={[name, 'quantity']}
                        fieldKey={[fieldKey, 'quantity']}
                        rules={[{ required: true, message: 'Introduce cantidad' }]}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Cantidad"
                          onChange={() => onQuantityOrPriceChange(name)}
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={[name, 'price']}
                        fieldKey={[fieldKey, 'price']}
                        rules={[{ required: true, message: 'Introduce precio' }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Precio"
                          onChange={() => onQuantityOrPriceChange(name)}
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={5} className="align-middle items-center justify-center">
                      <Form.Item
                        name={[name, 'total']}
                        fieldKey={[fieldKey, 'total']}
                        rules={[{ required: true, message: 'Falta total' }]}
                      >
                        <MoneyInputFormItem readOnly />
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name);
                          updateSubTotal();
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Añadir producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Divider dashed />

          <div className="relative w-full">
            <Row gutter={[2, -5]}>
              <Col className="gutter-row" span={10}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                    {translate('Save')}
                  </Button>
                </Form.Item>
              </Col>
              <Col
                className="gutter-row"
                md={{
                  span: 3,
                  offset: 15,
                }}
                xs={{
                  span: 7,
                  offset: 11,
                }}
              >
                <p
                  style={{
                    paddingLeft: '12px',
                    paddingTop: '5px',
                  }}
                >
                  {translate('Sub Total')} :
                </p>
              </Col>
              <Col className="gutter-row" span={6}>
                <MoneyInputFormItem readOnly value={subTotal} />
              </Col>
            </Row>
            <Row gutter={[12, -5]}>
              <Col
                className="gutter-row"
                md={{
                  span: 3,
                  offset: 15,
                }}
                xs={{
                  span: 7,
                  offset: 11,
                }}
                style={{ textAlign: 'center' }}
              >
                <Form.Item
                  name="taxRate"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <SelectAsync
                    value={taxRate}
                    onChange={handelTaxChange}
                    entity={'taxes'}
                    outputValue={'taxValue'}
                    displayLabels={['taxName']}
                    withRedirect={true}
                    urlToRedirect="/taxes"
                    redirectLabel="Add New Tax"
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={6}>
                <MoneyInputFormItem readOnly value={taxTotal} />
              </Col>
            </Row>

            <Row gutter={[12, -5]}>
              <Col
                className="gutter-row"
                md={{
                  span: 2,
                  offset: 16,
                }}
                xs={{
                  span: 5,
                  offset: 13,
                }}
                style={{
                  verticalAlign: 'middle',
                }}
              >
                <p
                  style={{
                    paddingLeft: '12px',
                    paddingTop: '5px',
                    verticalAlign: 'middle',
                  }}
                >
                  {translate('Total')} :
                </p>
              </Col>
              <Col className="gutter-row" span={6}>
                <MoneyInputFormItem readOnly value={total} />
              </Col>
            </Row>
          </div>
        </Form>
      </div>
    </div>
  );
}
