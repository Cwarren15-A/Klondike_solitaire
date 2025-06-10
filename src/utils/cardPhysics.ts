/**
 * Realistic Card Physics Engine
 * Advanced physics simulation for lifelike card behavior
 */

export interface PhysicsCard {
  id: string;
  position: Float32Array;
  rotation: Float32Array;
  velocity: Float32Array;
  angularVelocity: Float32Array;
  forces: Float32Array;
  mass: number;
  material: CardMaterial;
}

export interface CardMaterial {
  friction: number;
  restitution: number;
  stiffness: number;
  airResistance: number;
  thickness: number;
}

export class CardPhysicsEngine {
  private cards: Map<string, PhysicsCard> = new Map();
  private gravity = new Float32Array([0, -9.81, 0]);
  private airDensity = 1.225;
  private tableHeight = 0.0;
  private damping = 0.99;

  createCardMaterial(): CardMaterial {
    return {
      friction: 0.4,
      restitution: 0.15,
      stiffness: 2000,
      airResistance: 0.05,
      thickness: 0.0003
    };
  }

  addCard(id: string, position: Float32Array, rotation: Float32Array): PhysicsCard {
    const material = this.createCardMaterial();
    
    const card: PhysicsCard = {
      id,
      position: new Float32Array(position),
      rotation: new Float32Array(rotation),
      velocity: new Float32Array([0, 0, 0]),
      angularVelocity: new Float32Array([0, 0, 0]),
      forces: new Float32Array([0, 0, 0]),
      mass: 0.0018,
      material
    };
    
    this.cards.set(id, card);
    return card;
  }

  dealCard(cardId: string, targetPosition: Float32Array, power: number = 1.0): void {
    const card = this.cards.get(cardId);
    if (!card) return;
    
    const direction = new Float32Array([
      targetPosition[0] - card.position[0],
      targetPosition[1] - card.position[1],
      targetPosition[2] - card.position[2]
    ]);
    
    const length = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);
    if (length > 0) {
      direction[0] /= length;
      direction[1] /= length;
      direction[2] /= length;
    }
    
    const dealForce = 0.5 * power;
    const arcHeight = 0.3;
    
    card.velocity[0] = direction[0] * dealForce / card.mass;
    card.velocity[1] = (direction[1] + arcHeight) * dealForce / card.mass;
    card.velocity[2] = direction[2] * dealForce / card.mass;
    
    card.angularVelocity[0] += (Math.random() - 0.5) * 2;
    card.angularVelocity[1] += Math.random() * 1;
    card.angularVelocity[2] += (Math.random() - 0.5) * 1;
  }

  flipCard(cardId: string, flipForce: number = 1.0): void {
    const card = this.cards.get(cardId);
    if (!card) return;
    
    const flipTorque = 0.002 * flipForce;
    card.angularVelocity[1] += flipTorque / 0.000003;
    card.velocity[1] += 0.1;
    
    console.log(`🔄 Flipping card ${cardId} with physics`);
  }

  simulate(deltaTime: number): void {
    this.cards.forEach(card => {
      this.updateCardPhysics(card, deltaTime);
      this.handleCollisions(card);
    });
  }

  private updateCardPhysics(card: PhysicsCard, dt: number): void {
    card.forces.fill(0);
    
    // Apply gravity
    card.forces[1] += this.gravity[1] * card.mass;
    
    // Apply air resistance
    const speed = Math.sqrt(card.velocity[0]**2 + card.velocity[1]**2 + card.velocity[2]**2);
    if (speed > 0) {
      const dragForce = 0.5 * this.airDensity * card.material.airResistance * 0.0056 * speed * speed;
      const dragDirection = [-card.velocity[0]/speed, -card.velocity[1]/speed, -card.velocity[2]/speed];
      
      card.forces[0] += dragDirection[0] * dragForce;
      card.forces[1] += dragDirection[1] * dragForce;
      card.forces[2] += dragDirection[2] * dragForce;
    }
    
    // Integrate forces
    card.velocity[0] += (card.forces[0] / card.mass) * dt;
    card.velocity[1] += (card.forces[1] / card.mass) * dt;
    card.velocity[2] += (card.forces[2] / card.mass) * dt;
    
    card.position[0] += card.velocity[0] * dt;
    card.position[1] += card.velocity[1] * dt;
    card.position[2] += card.velocity[2] * dt;
    
    card.rotation[0] += card.angularVelocity[0] * dt;
    card.rotation[1] += card.angularVelocity[1] * dt;
    card.rotation[2] += card.angularVelocity[2] * dt;
    
    // Apply damping
    card.velocity[0] *= this.damping;
    card.velocity[1] *= this.damping;
    card.velocity[2] *= this.damping;
    
    card.angularVelocity[0] *= 0.98;
    card.angularVelocity[1] *= 0.98;
    card.angularVelocity[2] *= 0.98;
  }

  private handleCollisions(card: PhysicsCard): void {
    if (card.position[1] <= this.tableHeight + card.material.thickness/2) {
      card.position[1] = this.tableHeight + card.material.thickness/2;
      
      if (card.velocity[1] < 0) {
        card.velocity[1] *= -card.material.restitution;
      }
      
      const frictionForce = card.material.friction * Math.abs(card.velocity[1]);
      card.velocity[0] *= Math.max(0, 1 - frictionForce);
      card.velocity[2] *= Math.max(0, 1 - frictionForce);
      
      card.angularVelocity[0] *= 0.8;
      card.angularVelocity[2] *= 0.8;
    }
  }

  getCard(cardId: string): PhysicsCard | undefined {
    return this.cards.get(cardId);
  }

  setCardPosition(cardId: string, position: Float32Array): void {
    const card = this.cards.get(cardId);
    if (card) {
      card.position.set(position);
      card.velocity.fill(0);
      card.angularVelocity.fill(0);
    }
  }

  removeCard(cardId: string): void {
    this.cards.delete(cardId);
  }

  destroy(): void {
    this.cards.clear();
    console.log('🧹 Card Physics Engine destroyed');
  }
}

 