const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const Order = require('../lib/models/Order');

jest.mock('../lib/utils/twilio.js');
const twilio = require('../lib/utils/twilio.js');

describe('03_separation-of-concerns routes', () => {
	beforeEach(() => {
		return setup(pool);
	});

	let order;
	beforeEach(async () => {
		order = await Order.insert({ quantity: 10 });
		twilio.sendSms.mockClear();
	});

	it('creates a new order in our database and sends a text message', async () => {
		const res = await request(app)
			.post('/api/v1/orders')
			.send({ quantity: 10 });

		expect(twilio.sendSms).toHaveBeenCalledTimes(1);
		expect(res.body).toEqual({
			id: '2',
			quantity: 10,
		});
	});

	it('finds all orders in our database', async () => {
		const res = await request(app).get('/api/v1/orders');

		expect(res.body).toEqual([
			{
				id: '1',
				quantity: 10,
			},
		]);
	});

	it('finds a specific order by its id', async () => {
		const res = await request(app).get('/api/v1/orders/1');

		expect(res.body).toEqual({
			id: '1',
			quantity: 10,
		});
	});

	it('should update an order based on the given ID', async () => {
		const res = await request(app)
			.put('/api/v1/orders/1')
			.send({ quantity: 5 });

		expect(twilio.sendSms).toHaveBeenCalledTimes(1);
		expect(res.body).toEqual({
			id: '1',
			quantity: 5,
		});
	});

	it('should delete an order based on the given ID', async () => {
		const res = await request(app).delete('/api/v1/orders/1');

		expect(twilio.sendSms).toHaveBeenCalledTimes(1);
		expect(res.body).toEqual({
			id: '1',
			quantity: 10,
		});
	});
});
