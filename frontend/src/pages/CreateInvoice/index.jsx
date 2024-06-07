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

const hardcodedItems = [
  { name: 'PAH', price: 21.5, desc: 'PAPEL HIGIENICO INDUSRIAL' },
  { name: 'BFRUG', price: 30.5, desc: 'BOLSA FRUTA GRANDE' },
  { name: 'BFRUM', price: 21.5, desc: 'BOLSA FRUTA MEDIANA' },
  { name: 'BFRUP', price: 16.5, desc: 'BOLSA FRUTA PEQUEÑA' },
  { name: 'BA199', price: 48.5, desc: 'BANDEJA 199 BLANCA' },
  { name: 'CTA35', price: 1.9, desc: 'BOLSA CAMISETA 35X50' },
  { name: 'PET1000', price: 92.5, desc: 'TARRINA PET 1000' },
  { name: 'VA15', price: 33.0, desc: 'VACIO 15X20' },
  { name: 'VA25', price: 7.03, desc: 'VACIO 25X35' },
  { name: 'PA27', price: 25.0, desc: 'PAPEL 27X38 GRACIAS COMPRA' },
  { name: 'BAS85', price: 1.5, desc: 'BOLSA BASURA 85X105' },
  { name: 'GU', price: 4.13, desc: 'GUANTES DE NITRILO' },
  { name: 'SERV', price: 100.76, desc: 'SERVILLETA ABSORVENTE' },
  { name: 'LEJ', price: 7.43, desc: 'LEJIA ALIMENTARIA' },
  { name: 'VA2030', price: 4.0, desc: 'VACIO 20X30' },
  { name: 'BA199', price: 48.5, desc: 'BANDEJA 199 BLANCA' },
  { name: 'F60', price: 38.0, desc: 'FILM 60X1500' },
  { name: 'H27', price: 24.0, desc: 'LONCHEADO H27' },
  { name: 'F45', price: 7.5, desc: 'FILM 45X300' },
  { name: 'F90', price: 85.0, desc: 'FILM 90X1500' },
  { name: 'BA89N', price: 30.22, desc: 'BANDEJA 89 NEGRA' },
  { name: 'FPA45', price: 9.26, desc: 'FILM DE PALETIZAR DE 45X300' },
  { name: 'PL23', price: 23.0, desc: 'DESCRICPCION' },
  { name: 'PPOR', price: 160.0, desc: 'PROTECCION POREX' },
  { name: 'BA89', price: 30.22, desc: 'BANDEJA 89 BLANCA' },
  { name: 'BA70', price: 36.3, desc: 'BANDEJA 70 BLANCA' },
  { name: 'PREC', price: 3.33, desc: 'PRECINTO PROTECTOR' },
  { name: 'BA85', price: 37.44, desc: 'BANDEJA 85 BLANCA' },
  { name: 'BA80', price: 30.0, desc: 'BANDEJA 80 BLANCA' },
];

export default function CrearFactura({ subTotal: initialSubTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [recargoTotal, setRecargoTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(initialSubTotal);
  const [products, setProducts] = useState([]); // State to hold fetched products
  const [error, setError] = useState(null);

  const entity = 'invoice';

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
    const item = hardcodedItems.find((item) => item.name === value);
    if (item) {
      const fields = form.getFieldsValue();
      fields.items[index].description = item.desc;
      fields.items[index].price = item.price;
      form.setFieldsValue(fields);
      updateItemTotal(index);
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
    navigate('/invoice'); // Add this line to redirect after submitting
  };

  return (
    <div>
      <div className="bg-white p-10 rounded-2xl">
      <h2 className="font-bold text-2xl pb-6">Crear factura</h2>
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
                          showSearch // Enable text search
                          optionFilterProp="children" // Filter based on children
                        >
                          {hardcodedItems.map((item) => (
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
                span={3}
                offset={15}
                style={{
                  verticalAlign: 'middle',
                }}
              >
                <Form.Item
                  name="recargo"
                  rules={[
                    {
                      required: false,
                      message: 'Introduzca recargo.',
                    },
                  ]}
                  initialValue="¿Recargo?"
                >
                  <Select
                    value={recargo}
                    onChange={recargoChange}
                    bordered={false}
                    options={[
                      { value: 0, label: 'Sin recargo' },
                      { value: 5.2, label: '5.2%' }, // recargo value is 5.2%
                    ]}
                    style={{
                      textSizeAdjust: '10px',
                    }}
                  ></Select>
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={6}>
                <MoneyInputFormItem readOnly value={recargoTotal} />
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
