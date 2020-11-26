import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { name } = req.query;
    const { page = 1 } = req.query;

    if (name) {
      const students = await Student.findAndCountAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
        limit: 10,
        offset: (page - 1) * 10,
      });

      if (!students) {
        return res.status(400).json({ error: 'Students not found' });
      }

      return res.json(students);
    }

    const students = await Student.findAndCountAll({
      limit: 10,
      offset: (page - 1) * 10,
      order: ['name'],
    });

    if (!students) {
      return res.status(400).json({ error: 'Students not found' });
    }

    return res.json(students);
  }

  async show(req, res) {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    return res.json(student);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      height: Yup.number().required(),
      weight: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email, age, height, weight } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      height,
      weight,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number().min(1),
      height: Yup.number(),
      weight: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(id);

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'E-mail already in use' });
      }
    }

    const { name, height, weight, age } = await student.update(req.body);

    return res.json({
      id,
      name,
      email,
      age,
      height,
      weight,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    await student.destroy();

    return res.send();
  }
}

export default new StudentController();
