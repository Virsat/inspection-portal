import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Device {
  id: string;
  name: string;
  createdAt: string;
}

@Injectable()
export class DevicesService implements OnModuleInit {
  private readonly filePath = path.join(process.cwd(), 'devices.json');
  private devices: Device[] = [];

  onModuleInit() {
    this.ensureFileExists();
    this.loadDevices();
  }

  private ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  private loadDevices() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      this.devices = JSON.parse(data);
    } catch (e) {
      this.devices = [];
    }
  }

  private saveDevices() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.devices, null, 2));
  }

  registerDevice(id: string, name: string) {
    if (this.devices.find(d => d.id === id)) {
      return { success: false, message: 'Device ID already registered' };
    }
    const newDevice = { id, name, createdAt: new Date().toISOString() };
    this.devices.push(newDevice);
    this.saveDevices();
    return { success: true, device: newDevice };
  }

  isValidDevice(id: string): boolean {
    return this.devices.some(d => d.id === id);
  }

  getAllDevices() {
    return this.devices;
  }

  deleteDevice(id: string) {
    const initialLength = this.devices.length;
    this.devices = this.devices.filter(d => d.id !== id);
    if (this.devices.length !== initialLength) {
      this.saveDevices();
      return true;
    }
    return false;
  }
}
