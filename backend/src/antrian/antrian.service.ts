import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Antrian } from './antrian.model';
import { Op } from 'sequelize';
import moment from 'moment-timezone'; 

@Injectable()
export class AntrianService {
  constructor(
    @InjectModel(Antrian)
    private AntrianModel: typeof Antrian,
  ) {}

  async generateNewAntrian(): Promise<Antrian> {
    const today = moment().tz('Asia/Jakarta').startOf('day').toDate();
    const lastAntrian = await this.AntrianModel.findOne({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
      order: [['id_antrian', 'DESC']],
    });

    let nextNumber;
    if (lastAntrian) {
      const lastNo = lastAntrian?.get('no_antrian') as string | null;
      nextNumber = lastNo ? parseInt(lastNo.replace(/[^0-9]/g, '')) + 1 : 1;
      // nextNumber = parseInt(lastAntrian.no_antrian.replace(/[^0-9]/g, '')) + 1;
    }else{
      nextNumber = 1
    }

    const AntrianString = `A${nextNumber.toString().padStart(3, '0')}`;
    return this.AntrianModel.create({
      no_antrian: AntrianString,
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  async getDisplayAntrians() {
    let current = await this.AntrianModel.findOne({
      where: { status: 'called' },
      order: [['createdAt', 'ASC']],
    });

    if (!current) {
      current = await this.AntrianModel.findOne({
        where: { status: 'waiting' },
        order: [['createdAt', 'ASC']],
      });
    }

    let kiosk = await this.AntrianModel.findOne({
      where: { status: 'waiting' },
      order: [['createdAt', 'DESC']],
    });

    if (!kiosk) {
      kiosk = await this.AntrianModel.findOne({
        where: { status: 'called' },
        order: [['createdAt', 'DESC']],
      });
    }

    let waiting = await this.AntrianModel.findAll({
      where: {
        status: 'waiting',
        ...(current && { createdAt: { [Op.gt]: current.createdAt } }),
      },
      order: [['createdAt', 'ASC']],
      limit: 4,
    });

    return { current, kiosk, waiting };
  }

  async getLastAntrian() {
    const current = await this.AntrianModel.findOne({
      order: [['updatedAt', 'DESC']],
    });

    let waiting;
    if (!current) {
      waiting = await this.AntrianModel.findAll({
        order: [['createdAt', 'ASC']],
        limit: 4,
      });
    }

    return { current, waiting };
  }

  async callNextAntrian(id_antrian: number):Promise<Antrian | null> {
    const dataAntrian = await this.AntrianModel.findByPk(id_antrian);
    if (!dataAntrian) return null;
    await this.AntrianModel.update(
      { status: 'called', updatedAt: new Date() },
      { where: { id_antrian } }
    );

    return this.AntrianModel.findByPk(id_antrian);
  }

 async skipAntrian(id_antrian: number): Promise<Antrian | null> {
    const dataAntrian = await this.AntrianModel.findByPk(id_antrian);
    if (!dataAntrian) return null;

    await this.AntrianModel.update(
      { status: 'skipped', updatedAt: new Date() },
      { where: { id_antrian } }
    );

    const nextAntri = await this.AntrianModel.findOne({
      where: { status: 'waiting' },
      order: [['createdAt', 'ASC']],
    });
    
    const idnyaantrian = nextAntri?.get('id_antrian') as number;
    if (nextAntri) {
      await this.AntrianModel.update(
        { status: 'called', updatedAt: new Date() },
        { where: { id_antrian:idnyaantrian } }
      );
    }

    return this.AntrianModel.findByPk(id_antrian);
  }

  async repeatAntrian(id_antrian: number): Promise<Antrian | null> {
    console.log("repeat id_antrian:", id_antrian);
    if (!id_antrian) return null;

    const dataAntrian = await this.AntrianModel.findByPk(id_antrian);
    if (!dataAntrian) return null;

    await this.AntrianModel.update(
      { updatedAt: new Date() },
      { where: { id_antrian } }
    );

    return this.AntrianModel.findByPk(id_antrian);
  }

  async finishAntrian(id_antrian: number): Promise<Antrian | null> {

    const dataAntrian = await this.AntrianModel.findByPk(id_antrian);
    if (!dataAntrian) return null;

    await this.AntrianModel.update(
      { status: 'done', updatedAt: new Date() },
      { where: { id_antrian } }
    );

    const nextAntri = await this.AntrianModel.findOne({
      where: { status: 'waiting' },
      order: [['createdAt', 'ASC']],
    });
    
    const idnyaantrian = nextAntri?.get('id_antrian') as number;
    if (nextAntri) {
      await this.AntrianModel.update(
        { status: 'called', updatedAt: new Date() },
        { where: { id_antrian:idnyaantrian } }
      );
    }

    return this.AntrianModel.findByPk(id_antrian);
  }


  async getWaitingTokens() {
    return this.AntrianModel.findAll({
      where: { status: 'waiting' },
      order: [['createdAt', 'ASC']],
    });
  }
  async getCalledTokens() {
    return this.AntrianModel.findAll({
      where: { status: 'called' },
      order: [['createdAt', 'ASC']],
    });
  }
}