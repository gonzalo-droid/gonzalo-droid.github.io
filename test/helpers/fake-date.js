// Se carga con `node -r` para correr el build "otro día": new Date() sin
// argumentos devuelve una fecha fija. Las fechas con argumentos no cambian.
const RealDate = Date;
const FIXED = new RealDate(process.env.FAKE_NOW || '2030-06-15T12:00:00');
class FakeDate extends RealDate {
  constructor(...args) { super(...(args.length ? args : [FIXED.getTime()])); }
  static now() { return FIXED.getTime(); }
}
global.Date = FakeDate;
